// ============================================
// MQTT Broker Configuration - EMQX Public
// ============================================

const config = {
    // EMQX Public Broker
    host: "broker.emqx.io",          // Hostname EMQX Public
    port: 8084,                       // Port WebSocket SSL/TLS
    
    // Alternative ports:
    // 8083 - WebSocket (ws://)
    // 8084 - WebSocket Secure (wss://) - RECOMMENDED
    // 1883 - TCP/IP (untuk ESP32)
    // 8883 - TCP/IP SSL (untuk ESP32)
    
    // Connection Options
    useTLS: true,                     // true = wss://, false = ws://
    cleansession: true,               // true = fresh start setiap connect
    
    // Credentials (untuk public broker, biarkan kosong)
    username: "",                     // Tidak perlu untuk EMQX public
    password: "",                     // Tidak perlu untuk EMQX public
    
    // Client ID (akan di-generate otomatis jika kosong)
    clientId: "",                     // Kosongkan, akan auto-generate
    
    // Topics Configuration
    // PENTING: Gunakan prefix unik untuk menghindari collision dengan user lain!
    uniquePrefix: "Ryan24",     // ⚠️ GANTI INI dengan nama unik Anda!
    
    topics: {
        temperature: "",              // Akan di-set otomatis berdasarkan prefix
        humidity: "",                 // Akan di-set otomatis berdasarkan prefix
        led: "",                      // Akan di-set otomatis berdasarkan prefix
        status: "",                   // Akan di-set otomatis berdasarkan prefix
    },
    
    // Quality of Service (QoS)
    qos: 0,                          // 0 = at most once, 1 = at least once, 2 = exactly once
    
    // Keep Alive (seconds)
    keepalive: 60,
    
    // Reconnect Options
    reconnect: true,
    reconnectPeriod: 5000,           // 5 detik
    
    // Connection Timeout
    timeout: 10,                      // 10 detik
};

// Auto-generate topics berdasarkan unique prefix
config.topics.temperature = `${config.uniquePrefix}/suhu`;
config.topics.humidity = `${config.uniquePrefix}/kelembaban`;
config.topics.led = `${config.uniquePrefix}/led`;
config.topics.status = `${config.uniquePrefix}/status`;

// Generate Client ID jika kosong
if (!config.clientId) {
    config.clientId = `web_${config.uniquePrefix}_${Math.random().toString(16).substr(2, 8)}`;
}

// Build WebSocket URL
config.url = `${config.useTLS ? 'wss' : 'ws'}://${config.host}:${config.port}/mqtt`;

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}

// Console log untuk debugging
console.log('🔧 MQTT Configuration Loaded:');
console.log('📡 Broker:', config.host);
console.log('🔌 Port:', config.port);
console.log('🔐 Protocol:', config.useTLS ? 'WSS (Secure)' : 'WS (Non-secure)');
console.log('📝 Client ID:', config.clientId);
console.log('📂 Topics:');
console.log('   • Temperature:', config.topics.temperature);
console.log('   • Humidity:', config.topics.humidity);
console.log('   • LED Control:', config.topics.led);
console.log('   • Status:', config.topics.status);
console.log('⚠️  Note: Pastikan uniquePrefix sama dengan yang di ESP32 code!');