// ============================================
// MQTT WebSocket Handler - EMQX Public
// ============================================

class MQTTClient {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.isConnected = false;
        this.callbacks = {
            onConnect: null,
            onDisconnect: null,
            onMessage: null,
            onError: null
        };
    }

    // Connect to MQTT Broker
    connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log(`🔄 Connecting to ${this.config.host}:${this.config.port}...`);
                
                // Create Paho MQTT Client
                this.client = new Paho.Client(
                    this.config.host,
                    this.config.port,
                    '/mqtt',
                    this.config.clientId
                );

                // Set callbacks
                this.client.onConnectionLost = (responseObject) => {
                    this.handleConnectionLost(responseObject);
                };

                this.client.onMessageArrived = (message) => {
                    this.handleMessageArrived(message);
                };

                // Connection options
                const connectOptions = {
                    useSSL: this.config.useTLS,
                    timeout: this.config.timeout,
                    keepAliveInterval: this.config.keepalive,
                    cleanSession: this.config.cleansession,
                    onSuccess: () => {
                        this.handleConnectSuccess();
                        resolve();
                    },
                    onFailure: (error) => {
                        this.handleConnectFailure(error);
                        reject(error);
                    }
                };

                // Add credentials if provided
                if (this.config.username) {
                    connectOptions.userName = this.config.username;
                }
                if (this.config.password) {
                    connectOptions.password = this.config.password;
                }

                // Connect
                this.client.connect(connectOptions);

            } catch (error) {
                console.error('❌ Connection error:', error);
                reject(error);
            }
        });
    }

    // Disconnect from broker
    disconnect() {
        if (this.client && this.isConnected) {
            this.client.disconnect();
            this.isConnected = false;
            console.log('🔌 Disconnected from MQTT broker');
            
            if (this.callbacks.onDisconnect) {
                this.callbacks.onDisconnect();
            }
        }
    }

    // Subscribe to topic
    subscribe(topic, qos = 0) {
        if (!this.isConnected) {
            console.error('❌ Cannot subscribe: Not connected to broker');
            return false;
        }

        try {
            this.client.subscribe(topic, { qos: qos });
            console.log(`📡 Subscribed to: ${topic} (QoS ${qos})`);
            return true;
        } catch (error) {
            console.error(`❌ Subscribe error for ${topic}:`, error);
            return false;
        }
    }

    // Unsubscribe from topic
    unsubscribe(topic) {
        if (!this.isConnected) {
            console.error('❌ Cannot unsubscribe: Not connected to broker');
            return false;
        }

        try {
            this.client.unsubscribe(topic);
            console.log(`📡 Unsubscribed from: ${topic}`);
            return true;
        } catch (error) {
            console.error(`❌ Unsubscribe error for ${topic}:`, error);
            return false;
        }
    }

    // Publish message
    publish(topic, payload, qos = 0, retained = false) {
        if (!this.isConnected) {
            console.error('❌ Cannot publish: Not connected to broker');
            return false;
        }

        try {
            const message = new Paho.Message(payload.toString());
            message.destinationName = topic;
            message.qos = qos;
            message.retained = retained;
            
            this.client.send(message);
            console.log(`📤 Published to ${topic}: ${payload}`);
            return true;
        } catch (error) {
            console.error(`❌ Publish error to ${topic}:`, error);
            return false;
        }
    }

    // Handle successful connection
    handleConnectSuccess() {
        this.isConnected = true;
        console.log('✅ Connected to MQTT broker successfully!');
        console.log(`📝 Client ID: ${this.config.clientId}`);
        
        if (this.callbacks.onConnect) {
            this.callbacks.onConnect();
        }
    }

    // Handle connection failure
    handleConnectFailure(error) {
        this.isConnected = false;
        console.error('❌ Connection failed:', error.errorMessage || error);
        
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }

    // Handle connection lost
    handleConnectionLost(responseObject) {
        this.isConnected = false;
        
        if (responseObject.errorCode !== 0) {
            console.error('⚠️ Connection lost:', responseObject.errorMessage);
        } else {
            console.log('🔌 Connection closed normally');
        }
        
        if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect(responseObject);
        }

        // Auto reconnect if enabled
        if (this.config.reconnect) {
            console.log(`🔄 Reconnecting in ${this.config.reconnectPeriod / 1000} seconds...`);
            setTimeout(() => {
                this.connect().catch(err => {
                    console.error('❌ Reconnection failed:', err);
                });
            }, this.config.reconnectPeriod);
        }
    }

    // Handle incoming message
    handleMessageArrived(message) {
        const topic = message.destinationName;
        const payload = message.payloadString;
        
        console.log(`📥 Message received [${topic}]: ${payload}`);
        
        if (this.callbacks.onMessage) {
            this.callbacks.onMessage(topic, payload, message);
        }
    }

    // Set callback functions
    onConnect(callback) {
        this.callbacks.onConnect = callback;
    }

    onDisconnect(callback) {
        this.callbacks.onDisconnect = callback;
    }

    onMessage(callback) {
        this.callbacks.onMessage = callback;
    }

    onError(callback) {
        this.callbacks.onError = callback;
    }

    // Get connection status
    getStatus() {
        return {
            connected: this.isConnected,
            clientId: this.config.clientId,
            broker: this.config.host,
            port: this.config.port,
            secure: this.config.useTLS
        };
    }
}

// Export untuk digunakan di file lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MQTTClient;
}