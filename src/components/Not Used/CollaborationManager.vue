<!-- src/components/CollaborationManager.vue -->
<template>
  <!-- This component doesn't need a visual representation -->
</template>

<script>
import { Peer } from 'peerjs';

export default {
  props: {
    userId: { type: String, required: false, default: '' },
    sessionId: { type: String, required: false, default: '' },
    shapes: { type: Array, default: () => [] }
  },
  emits: ['update:shapes', 'update:status-message'],
  data() {
    return {
      peer: null,
      connections: []
    };
  },
  watch: {
    shapes: {
      handler(newShapes) {
        this.broadcastShapes(newShapes);
      },
      deep: true
    }
  },
  mounted() {
    this.initPeerJS();
  },
  beforeUnmount() {
    if (this.peer) {
      this.peer.destroy();
    }
  },
  methods: {
    initPeerJS() {
      const peerId = this.userId && this.userId.trim() !== '' ? this.userId : `user-${Date.now()}`;
      this.peer = new Peer(peerId, {
        // Using the default PeerJS server which is more reliable
        // than the Heroku server that's failing
        debug: 2 // Set debug level to help with troubleshooting
      });

      this.peer.on('open', (id) => {
        console.log('PeerJS: My peer ID is ' + id);
        this.$emit('update:status-message', `Connected as ${id}`);
        this.connectToPeers();
      });

      this.peer.on('connection', (conn) => {
        console.log('PeerJS: Incoming connection from ' + conn.peer);
        this.connections.push(conn);

        conn.on('data', (data) => {
          if (data.type === 'shapes') {
            this.$emit('update:shapes', data.shapes);
          }
        });

        conn.on('close', () => {
          console.log('PeerJS: Connection closed with ' + conn.peer);
          this.connections = this.connections.filter(c => c !== conn);
        });
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Error:', err);
        this.$emit('update:status-message', 'Collaboration error: ' + err.message);
      });
    },
    connectToPeers(otherUserId = null) {
      // Only prompt if no ID is provided and sessionId is empty
      if (!otherUserId && (!this.sessionId || this.sessionId.trim() === '')) {
        otherUserId = prompt('Enter another user ID to collaborate with (or leave blank):');
      } else if (!otherUserId) {
        // Use sessionId as the peer to connect to if available
        otherUserId = this.sessionId;
      }

      if (otherUserId && otherUserId !== this.userId) {
        const conn = this.peer.connect(otherUserId);
        conn.on('open', () => {
          console.log('PeerJS: Connected to ' + otherUserId);
          this.connections.push(conn);
          conn.send({ type: 'shapes', shapes: this.shapes });
        });
        conn.on('data', (data) => {
          if (data.type === 'shapes') {
            this.$emit('update:shapes', data.shapes);
          }
        });
        conn.on('close', () => {
          console.log('PeerJS: Connection closed with ' + otherUserId);
          this.connections = this.connections.filter(c => c !== conn);
        });
      }
    },
    broadcastShapes(shapes) {
      this.connections.forEach(conn => {
        if (conn.open) {
          conn.send({ type: 'shapes', shapes: shapes });
        }
      });
    },

    // Public method to connect to a specific peer
    connectToPeer(peerId) {
      if (peerId && peerId.trim() !== '' && peerId !== this.userId) {
        this.connectToPeers(peerId);
        return true;
      }
      return false;
    },

    // Get current peer ID and connection status
    getConnectionInfo() {
      return {
        peerId: this.peer ? this.peer.id : null,
        connected: this.peer ? this.peer.open : false,
        connections: this.connections.length,
        connectionIds: this.connections.map(conn => conn.peer)
      };
    }
  }
};
</script>
