/**
 * Centralized Database Management System
 * Handles all Supabase connections and database operations
 */

class DatabaseManager {
    constructor() {
        this.supabase = null;
        this.isConnected = false;
        this.connectionRetries = 0;
        this.maxRetries = 3;
        this.init();
    }

    async init() {
        try {
            console.log('🔗 Initializing Database Manager...');
            
            // Supabase가 완전히 로드될 때까지 대기
            if (window.waitForSupabase) {
                console.log('⏳ Waiting for Supabase to be ready...');
                await window.waitForSupabase();
            }
            
            // Check if Supabase is available
            if (typeof window.supabase !== 'undefined' && typeof window.supabase.from === 'function') {
                this.supabase = window.supabase;
                console.log('✅ Using global Supabase client');
            } else if (typeof window.sb !== 'undefined' && typeof window.sb.from === 'function') {
                this.supabase = window.sb;
                console.log('✅ Using global sb client');
            } else {
                throw new Error('No valid Supabase client found');
            }

            // Test connection
            await this.testConnection();
            
        } catch (error) {
            console.error('❌ Database Manager initialization failed:', error);
            this.handleConnectionError(error);
        }
    }

    async testConnection() {
        try {
            console.log('🔍 Testing database connection...');
            
            const { data, error } = await this.supabase
                .from('vwtm_list_data')
                .select('count', { count: 'exact', head: true });

            if (error) {
                throw error;
            }

            this.isConnected = true;
            console.log('✅ Database connection successful');
            
        } catch (error) {
            console.error('❌ Database connection test failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    async retryConnection() {
        if (this.connectionRetries >= this.maxRetries) {
            throw new Error('Max connection retries exceeded');
        }

        this.connectionRetries++;
        console.log(`🔄 Retrying database connection (${this.connectionRetries}/${this.maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, 1000 * this.connectionRetries));
        return this.testConnection();
    }

    handleConnectionError(error) {
        console.error('❌ Database connection error:', error);
        
        if (this.connectionRetries < this.maxRetries) {
            console.log('🔄 Attempting to retry connection...');
            this.retryConnection();
        } else {
            console.error('❌ Max retries exceeded, database unavailable');
            this.showUserError('Database connection failed. Please refresh the page.');
        }
    }

    showUserError(message) {
        // Create a user-friendly error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'database-error';
        errorDiv.innerHTML = `
            <div class="error-message">
                <h3>⚠️ Database Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()">Refresh Page</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(errorDiv);
    }

    // Get database client
    getClient() {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        return this.supabase;
    }

    // Check if database is ready
    isReady() {
        return this.isConnected && this.supabase;
    }

    // Generic query method
    async query(table, options = {}) {
        try {
            if (!this.isReady()) {
                throw new Error('Database not ready');
            }

            let query = this.supabase.from(table);

            // Apply select
            if (options.select) {
                query = query.select(options.select);
            }

            // Apply filters
            if (options.filters) {
                options.filters.forEach(filter => {
                    query = query.eq(filter.column, filter.value);
                });
            }

            // Apply ordering
            if (options.orderBy) {
                query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
            }

            // Apply pagination
            if (options.range) {
                query = query.range(options.range.from, options.range.to);
            }

            // Execute query
            const { data, error, count } = await query;

            if (error) {
                throw error;
            }

            return { data, count };

        } catch (error) {
            console.error(`❌ Query failed for table ${table}:`, error);
            throw error;
        }
    }

    // Batch operations
    async batchInsert(table, data, batchSize = 1000) {
        try {
            console.log(`📦 Starting batch insert for ${data.length} records...`);
            
            const batches = [];
            for (let i = 0; i < data.length; i += batchSize) {
                batches.push(data.slice(i, i + batchSize));
            }

            let totalInserted = 0;
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} records)`);
                
                const { error } = await this.supabase
                    .from(table)
                    .insert(batch);

                if (error) {
                    throw error;
                }

                totalInserted += batch.length;
                
                // Small delay to avoid overwhelming the database
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            console.log(`✅ Batch insert completed: ${totalInserted} records inserted`);
            return totalInserted;

        } catch (error) {
            console.error('❌ Batch insert failed:', error);
            throw error;
        }
    }
}

// Create global instance
window.DatabaseManager = DatabaseManager;
window.dbManager = new DatabaseManager();

console.log('✅ Database Manager loaded');
