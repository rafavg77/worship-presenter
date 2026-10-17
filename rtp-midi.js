import dgram from 'dgram';
import os from 'os';
import { EventEmitter } from 'events';
import { spawn } from 'child_process';

/**
 * Native Apple Network MIDI (RTP-MIDI / RFC 6295) Server & Auto-Connector
 * - Listens on UDP 5004 (Control) and 5005 (Data/RTP)
 * - Queries mDNS (_apple-midi._udp.local) to discover iPads, iPhones, and Macs on Wi-Fi
 * - Automatically invites discovered iOS/macOS devices so Playback immediately sees
 *   "Worship Presenter" as an active Network Session without manual pairing.
 */
export class RtpMidiManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.sessionName = options.sessionName || 'Worship Presenter';
    this.controlPort = options.controlPort || 5004;
    this.dataPort = options.dataPort || 5005;
    this.ssrc = (Math.floor(Math.random() * 0x7fffffff) + 100000) >>> 0;
    this.peers = new Map(); // key: ip -> peer state
    this.ctrlSock = null;
    this.dataSock = null;
    this.mdnsSock = null;
    this.avahiProc = null;
    this.scanTimer = null;
    this.syncTimer = null;
    this.startTime = process.hrtime.bigint();
  }

  getTimestamp100us() {
    const elapsedNs = process.hrtime.bigint() - this.startTime;
    return elapsedNs / 100000n; // units of 100 microseconds per Apple MIDI spec
  }

  start() {
    this.ctrlSock = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    this.dataSock = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    this.ctrlSock.on('error', (err) => {
      console.error('[RTP-MIDI Control Error]:', err.message);
    });
    this.dataSock.on('error', (err) => {
      console.error('[RTP-MIDI Data Error]:', err.message);
    });

    this.ctrlSock.on('message', (msg, rinfo) => this.handleControlMessage(msg, rinfo));
    this.dataSock.on('message', (msg, rinfo) => this.handleDataMessage(msg, rinfo));

    this.ctrlSock.bind(this.controlPort, '0.0.0.0', () => {
      console.log(` 🎹 RTP-MIDI Control escuchando en UDP :${this.controlPort}`);
    });

    this.dataSock.bind(this.dataPort, '0.0.0.0', () => {
      console.log(` 🎹 RTP-MIDI Datos escuchando en UDP   :${this.dataPort}`);
    });

    this.startMdnsDiscovery();
    this.startAvahiPublish();

    // Periodic clock sync & auto-reconnect every 5 seconds
    this.syncTimer = setInterval(() => this.maintainPeers(), 5000);
  }

  stop() {
    if (this.scanTimer) clearInterval(this.scanTimer);
    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.avahiProc) {
      try { this.avahiProc.kill(); } catch (e) {}
    }
    if (this.ctrlSock) try { this.ctrlSock.close(); } catch (e) {}
    if (this.dataSock) try { this.dataSock.close(); } catch (e) {}
    if (this.mdnsSock) try { this.mdnsSock.close(); } catch (e) {}
  }

  startAvahiPublish() {
    // Try to publish _apple-midi._udp via avahi-publish-service if installed
    try {
      this.avahiProc = spawn('avahi-publish-service', [
        this.sessionName,
        '_apple-midi._udp',
        String(this.controlPort)
      ], { stdio: 'ignore' });
      this.avahiProc.on('error', () => {});
    } catch (e) {}
  }

  startMdnsDiscovery() {
    try {
      this.mdnsSock = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      this.mdnsSock.on('error', () => {});
      this.mdnsSock.on('message', (msg, rinfo) => this.handleMdnsPacket(msg, rinfo));

      this.mdnsSock.bind(5353, '0.0.0.0', () => {
        try {
          this.mdnsSock.addMembership('224.0.0.251');
        } catch (e) {}
        this.sendMdnsQuery();
      });

      this.scanTimer = setInterval(() => this.sendMdnsQuery(), 4000);
    } catch (e) {
      console.error('[RTP-MIDI mDNS Error]:', e.message);
    }
  }

  sendMdnsQuery() {
    if (!this.mdnsSock) return;
    // Build DNS PTR query for _apple-midi._udp.local
    const qname = Buffer.from([
      0x0b, ...Buffer.from('_apple-midi'),
      0x04, ...Buffer.from('_udp'),
      0x05, ...Buffer.from('local'),
      0x00
    ]);
    const header = Buffer.alloc(12);
    header.writeUInt16BE(0, 0); // ID
    header.writeUInt16BE(0, 2); // Flags
    header.writeUInt16BE(1, 4); // QDCOUNT = 1
    const footer = Buffer.from([0x00, 0x0c, 0x00, 0x01]); // PTR, IN
    const pkt = Buffer.concat([header, qname, footer]);

    try {
      this.mdnsSock.send(pkt, 5353, '224.0.0.251');
    } catch (e) {}
  }

  getLocalIps() {
    const ips = new Set(['127.0.0.1']);
    const ifaces = os.networkInterfaces();
    for (const list of Object.values(ifaces)) {
      for (const iface of list || []) {
        if (iface.family === 'IPv4') ips.add(iface.address);
      }
    }
    return ips;
  }

  handleMdnsPacket(msg, rinfo) {
    const localIps = this.getLocalIps();
    if (localIps.has(rinfo.address)) return;

    // Check if packet mentions _apple-midi
    if (!msg.includes(Buffer.from('_apple-midi'))) return;

    const ip = rinfo.address;
    // Extract readable device name if present
    let detectedName = ip;
    const ascii = msg.toString('latin1');
    const match = ascii.match(/(iPad[^\x00-\x1f]*|iPhone[^\x00-\x1f]*|Mac[^\x00-\x1f]*)/i);
    if (match && match[1]) {
      detectedName = match[1].replace(/[^\x20-\x7E]/g, '').trim();
    }

    this.ensurePeerInvited(ip, 5004, detectedName);
  }

  ensurePeerInvited(ip, controlPort = 5004, nameHint = '') {
    const localIps = this.getLocalIps();
    if (localIps.has(ip)) return;

    let peer = this.peers.get(ip);
    const now = Date.now();

    if (!peer) {
      peer = {
        ip,
        controlPort,
        dataPort: controlPort + 1,
        name: nameHint || ip,
        ssrc: null,
        state: 'discovered', // 'discovered' | 'ctrl_invited' | 'data_invited' | 'connected'
        lastSeen: now,
        lastInvite: 0,
        lastSeq: null
      };
      this.peers.set(ip, peer);
    } else {
      if (nameHint && (peer.name === ip || !peer.name)) {
        peer.name = nameHint;
      }
    }

    // If not connected or stale (>15s without traffic), send control invitation
    if (peer.state !== 'connected' && now - peer.lastInvite > 2500) {
      this.sendInvitation(ip, peer.controlPort, this.ctrlSock);
      peer.state = 'ctrl_invited';
      peer.lastInvite = now;
    }
  }

  sendInvitation(ip, port, sock) {
    const nameBuf = Buffer.from(this.sessionName + '\0', 'utf8');
    const pkt = Buffer.alloc(16 + nameBuf.length);
    pkt.writeUInt16BE(0xffff, 0);
    pkt.write('IN', 2, 2, 'ascii');
    pkt.writeUInt32BE(2, 4); // version 2
    const token = (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
    pkt.writeUInt32BE(token, 8);
    pkt.writeUInt32BE(this.ssrc, 12);
    nameBuf.copy(pkt, 16);

    sock.send(pkt, port, ip);
  }

  sendAccept(ip, port, sock, initiatorToken) {
    const nameBuf = Buffer.from(this.sessionName + '\0', 'utf8');
    const pkt = Buffer.alloc(16 + nameBuf.length);
    pkt.writeUInt16BE(0xffff, 0);
    pkt.write('OK', 2, 2, 'ascii');
    pkt.writeUInt32BE(2, 4); // version 2
    pkt.writeUInt32BE(initiatorToken, 8);
    pkt.writeUInt32BE(this.ssrc, 12);
    nameBuf.copy(pkt, 16);

    sock.send(pkt, port, ip);
  }

  handleControlMessage(msg, rinfo) {
    if (msg.length < 4 || msg.readUInt16BE(0) !== 0xffff) return;
    const cmd = msg.toString('ascii', 2, 4);
    const ip = rinfo.address;
    const now = Date.now();

    if (cmd === 'IN' && msg.length >= 16) {
      // Remote device (iPad/Mac) is inviting us on control port
      const token = msg.readUInt32BE(8);
      const remoteSsrc = msg.readUInt32BE(12);
      const remoteName = msg.slice(16).toString('utf8').replace(/\0.*$/g, '').trim() || ip;

      let peer = this.peers.get(ip) || {
        ip,
        controlPort: rinfo.port,
        dataPort: rinfo.port + 1,
        name: remoteName,
        ssrc: remoteSsrc,
        state: 'ctrl_invited',
        lastSeen: now,
        lastInvite: now,
        lastSeq: null
      };
      peer.name = remoteName;
      peer.ssrc = remoteSsrc;
      peer.controlPort = rinfo.port;
      peer.lastSeen = now;
      this.peers.set(ip, peer);

      this.sendAccept(ip, rinfo.port, this.ctrlSock, token);
    } else if (cmd === 'OK' && msg.length >= 16) {
      // Remote device accepted our control invitation -> now invite on data port!
      const remoteSsrc = msg.readUInt32BE(12);
      const remoteName = msg.slice(16).toString('utf8').replace(/\0.*$/g, '').trim();

      let peer = this.peers.get(ip);
      if (!peer) {
        peer = {
          ip,
          controlPort: rinfo.port,
          dataPort: rinfo.port + 1,
          name: remoteName || ip,
          ssrc: remoteSsrc,
          state: 'data_invited',
          lastSeen: now,
          lastInvite: now,
          lastSeq: null
        };
        this.peers.set(ip, peer);
      } else {
        if (remoteName) peer.name = remoteName;
        peer.ssrc = remoteSsrc;
        peer.lastSeen = now;
        peer.state = 'data_invited';
      }

      // Send invitation on Data port (5005)
      this.sendInvitation(ip, peer.dataPort, this.dataSock);
    } else if (cmd === 'BY') {
      const peer = this.peers.get(ip);
      if (peer) {
        peer.state = 'discovered';
        this.emitPeersUpdate();
      }
    }
  }

  handleDataMessage(msg, rinfo) {
    if (msg.length < 4) return;
    const ip = rinfo.address;
    const now = Date.now();

    // 1. Apple MIDI Session / Clock packet (starts with 0xFFFF)
    if (msg.readUInt16BE(0) === 0xffff) {
      const cmd = msg.toString('ascii', 2, 4);

      if (cmd === 'IN' && msg.length >= 16) {
        const token = msg.readUInt32BE(8);
        const remoteSsrc = msg.readUInt32BE(12);
        let peer = this.peers.get(ip);
        if (peer) {
          peer.ssrc = remoteSsrc;
          peer.dataPort = rinfo.port;
          peer.state = 'connected';
          peer.lastSeen = now;
        }
        this.sendAccept(ip, rinfo.port, this.dataSock, token);
        console.log(` ✅ [RTP-MIDI] Conectado por WiFi con: ${peer ? peer.name : ip} (${ip})`);
        this.emitPeersUpdate();
      } else if (cmd === 'OK' && msg.length >= 16) {
        const remoteSsrc = msg.readUInt32BE(12);
        const remoteName = msg.slice(16).toString('utf8').replace(/\0.*$/g, '').trim();
        let peer = this.peers.get(ip);
        if (peer) {
          if (remoteName) peer.name = remoteName;
          peer.ssrc = remoteSsrc;
          peer.dataPort = rinfo.port;
          const wasConnected = peer.state === 'connected';
          peer.state = 'connected';
          peer.lastSeen = now;
          if (!wasConnected) {
            console.log(` ✅ [RTP-MIDI] Conectado por WiFi con: ${peer.name} (${ip})`);
          }
        }
        this.sendClockSync(ip, rinfo.port, 0);
        this.emitPeersUpdate();
      } else if (cmd === 'CK' && msg.length >= 36) {
        const count = msg.readUInt8(8);
        let peer = this.peers.get(ip);
        if (peer) {
          peer.lastSeen = now;
          if (peer.state !== 'connected') {
            peer.state = 'connected';
            this.emitPeersUpdate();
          }
        }
        if (count === 0) {
          const reply = Buffer.from(msg);
          reply.writeUInt32BE(this.ssrc, 4);
          reply.writeUInt8(1, 8);
          reply.writeBigUInt64BE(this.getTimestamp100us(), 20);
          this.dataSock.send(reply, rinfo.port, ip);
        } else if (count === 1) {
          const reply = Buffer.from(msg);
          reply.writeUInt32BE(this.ssrc, 4);
          reply.writeUInt8(2, 8);
          reply.writeBigUInt64BE(this.getTimestamp100us(), 28);
          this.dataSock.send(reply, rinfo.port, ip);
        }
      }
      return;
    }

    // 2. Standard RTP-MIDI Data Packet (RFC 6295, RTP Version 2)
    if (msg.length >= 12 && (msg[0] & 0xc0) === 0x80) {
      const seq = msg.readUInt16BE(2);
      let peer = this.peers.get(ip);
      if (peer) {
        peer.lastSeen = now;
        peer.lastSeq = seq;
        if (peer.state !== 'connected') {
          peer.state = 'connected';
          this.emitPeersUpdate();
        }
        // Send Receiver Feedback (RS) so iOS flushes recovery journal
        this.sendReceiverFeedback(ip, peer.controlPort, seq);
      }

      this.parseRtpMidiPayload(msg, ip, peer ? peer.name : ip);
    }
  }

  sendClockSync(ip, port, count = 0) {
    const pkt = Buffer.alloc(36);
    pkt.writeUInt16BE(0xffff, 0);
    pkt.write('CK', 2, 2, 'ascii');
    pkt.writeUInt32BE(this.ssrc, 4);
    pkt.writeUInt8(count, 8);
    pkt.writeBigUInt64BE(this.getTimestamp100us(), 12);
    this.dataSock.send(pkt, port, ip);
  }

  sendReceiverFeedback(ip, controlPort, seq) {
    const pkt = Buffer.alloc(12);
    pkt.writeUInt16BE(0xffff, 0);
    pkt.write('RS', 2, 2, 'ascii');
    pkt.writeUInt32BE(this.ssrc, 4);
    pkt.writeUInt16BE(seq, 8);
    pkt.writeUInt16BE(0, 10);
    this.ctrlSock.send(pkt, controlPort, ip);
  }

  maintainPeers() {
    const now = Date.now();
    let changed = false;
    for (const [ip, peer] of this.peers.entries()) {
      if (peer.state === 'connected') {
        if (now - peer.lastSeen > 30000) {
          peer.state = 'discovered';
          changed = true;
          this.ensurePeerInvited(ip, peer.controlPort, peer.name);
        } else {
          this.sendClockSync(ip, peer.dataPort, 0);
        }
      } else {
        this.ensurePeerInvited(ip, peer.controlPort, peer.name);
      }
    }
    if (changed) this.emitPeersUpdate();
  }

  parseRtpMidiPayload(rtpPacket, sourceIp, sourceName) {
    // RTP header is 12 bytes (+ CSRC if CC > 0)
    const cc = rtpPacket[0] & 0x0f;
    let offset = 12 + cc * 4;
    if (offset >= rtpPacket.length) return;

    const flags = rtpPacket[offset];
    const isLongHeader = (flags & 0x80) !== 0;
    const hasLeadingDelta = (flags & 0x20) !== 0; // Z bit

    let cmdLen = 0;
    if (isLongHeader) {
      if (offset + 1 >= rtpPacket.length) return;
      cmdLen = ((flags & 0x0f) << 8) | rtpPacket[offset + 1];
      offset += 2;
    } else {
      cmdLen = flags & 0x0f;
      offset += 1;
    }

    if (cmdLen === 0 || offset + cmdLen > rtpPacket.length) return;
    const cmdEnd = offset + cmdLen;

    let firstCommand = true;
    let runningStatus = 0;

    while (offset < cmdEnd) {
      // Read Delta-Time (VLQ) if not first command or if Z bit is set
      if (!firstCommand || hasLeadingDelta) {
        while (offset < cmdEnd) {
          const b = rtpPacket[offset++];
          if ((b & 0x80) === 0) break;
        }
        if (offset >= cmdEnd) break;
      }
      firstCommand = false;

      let status = rtpPacket[offset];

      // System Real-Time (0xF8..0xFF) single-byte messages
      if (status >= 0xf8) {
        offset += 1;
        this.emitMidiMessage([status], sourceIp, sourceName);
        continue;
      }

      // System Common (0xF1..0xF6)
      if (status === 0xf2) {
        // Song Position Pointer (2 data bytes: LSB, MSB in 16th-note beats)
        if (offset + 2 >= cmdEnd) break;
        const lsb = rtpPacket[offset + 1];
        const msb = rtpPacket[offset + 2];
        offset += 3;
        this.emitMidiMessage([0xf2, lsb, msb], sourceIp, sourceName);
        continue;
      }
      if (status === 0xf1 || status === 0xf3) {
        // MTC Quarter Frame (0xF1) or Song Select (0xF3) -> 1 data byte
        if (offset + 1 >= cmdEnd) break;
        const d1 = rtpPacket[offset + 1];
        offset += 2;
        this.emitMidiMessage([status, d1], sourceIp, sourceName);
        continue;
      }
      if (status === 0xf6) {
        offset += 1;
        continue;
      }

      // SysEx (0xF0..0xF7)
      if (status === 0xf0 || status === 0xf7) {
        offset += 1;
        while (offset < cmdEnd && rtpPacket[offset] !== 0xf7 && rtpPacket[offset] < 0x80) {
          offset++;
        }
        if (offset < cmdEnd && rtpPacket[offset] === 0xf7) offset++;
        continue;
      }

      if (status >= 0x80) {
        runningStatus = status;
        offset += 1;
      } else if (runningStatus >= 0x80) {
        status = runningStatus;
      } else {
        offset += 1;
        continue;
      }

      const msgType = status & 0xf0;
      if (msgType === 0x80 || msgType === 0x90 || msgType === 0xa0 || msgType === 0xb0 || msgType === 0xe0) {
        if (offset + 1 >= cmdEnd) break;
        const data1 = rtpPacket[offset++];
        const data2 = rtpPacket[offset++];
        this.emitMidiMessage([status, data1, data2], sourceIp, sourceName);
      } else if (msgType === 0xc0 || msgType === 0xd0) {
        if (offset >= cmdEnd) break;
        const data1 = rtpPacket[offset++];
        this.emitMidiMessage([status, data1], sourceIp, sourceName);
      } else {
        offset += 1;
      }
    }
  }

  emitMidiMessage(bytes, sourceIp, sourceName) {
    const status = bytes[0];
    if (status >= 0xf8) {
      if (status === 0xf8) {
        this.emit('clock', { sourceIp, sourceName, timestamp: Date.now() });
      } else if (status === 0xfa || status === 0xfb || status === 0xfc) {
        this.emit('midi', {
          type: status === 0xfa ? 'start' : status === 0xfb ? 'continue' : 'stop',
          channel: 0,
          note: null,
          velocity: null,
          raw: bytes,
          sourceIp,
          sourceName
        });
      }
      return;
    }

    if (status === 0xf2) {
      const spp = ((bytes[2] & 0x7f) << 7) | (bytes[1] & 0x7f);
      this.emit('midi', {
        type: 'spp',
        channel: 0,
        note: null,
        velocity: spp, // 16th-note beats from start
        raw: bytes,
        sourceIp,
        sourceName
      });
      return;
    }

    if (status === 0xf3) {
      this.emit('midi', {
        type: 'songselect',
        channel: 0,
        note: bytes[1] & 0x7f,
        velocity: bytes[1] & 0x7f,
        raw: bytes,
        sourceIp,
        sourceName
      });
      return;
    }

    const msgType = status & 0xf0;
    const channel = (status & 0x0f) + 1;
    const data1 = bytes[1] ?? 0;
    const data2 = bytes[2] ?? 0;

    if (msgType === 0x90 && data2 > 0) {
      this.emit('midi', {
        type: 'noteon',
        channel,
        note: data1,
        velocity: data2,
        raw: bytes,
        sourceIp,
        sourceName
      });
    } else if (msgType === 0x80 || (msgType === 0x90 && data2 === 0)) {
      this.emit('midi', {
        type: 'noteoff',
        channel,
        note: data1,
        velocity: 0,
        raw: bytes,
        sourceIp,
        sourceName
      });
    } else if (msgType === 0xb0) {
      this.emit('midi', {
        type: 'cc',
        channel,
        controller: data1,
        value: data2,
        raw: bytes,
        sourceIp,
        sourceName
      });
    } else if (msgType === 0xc0) {
      this.emit('midi', {
        type: 'pc',
        channel,
        program: data1,
        raw: bytes,
        sourceIp,
        sourceName
      });
    }
  }

  getConnectedPeers() {
    const list = [];
    for (const peer of this.peers.values()) {
      if (peer.state === 'connected') {
        list.push({
          ip: peer.ip,
          name: peer.name,
          lastSeen: peer.lastSeen
        });
      }
    }
    return list;
  }

  emitPeersUpdate() {
    this.emit('peers', this.getConnectedPeers());
  }
}
