/**
 * TM System Manager
 * Centralized system initialization and management
 */

class SystemManager {
    constructor() {
        this.systems = new Map();
        this.initializedSystems = new Set();
        this.initQueue = [];
        this.isInitializing = false;
    }

    // 시스템 등록
    registerSystem(name, initFunction, dependencies = []) {
        this.systems.set(name, {
            initFunction,
            dependencies,
            status: 'registered'
        });
        console.log(`✅ System ${name} registered`);
    }

    // 시스템 초기화
    async initializeSystem(name) {
        try {
            if (this.initializedSystems.has(name)) {
                console.log(`⚠️ System ${name} already initialized`);
                return true;
            }

            const system = this.systems.get(name);
            if (!system) {
                throw new Error(`System ${name} not registered`);
            }

            // 의존성 확인
            for (const dep of system.dependencies) {
                if (!this.initializedSystems.has(dep)) {
                    console.log(`⏳ Waiting for dependency ${dep}...`);
                    await this.initializeSystem(dep);
                }
            }

            console.log(`🚀 Initializing system: ${name}`);
            system.status = 'initializing';
            
            await system.initFunction();
            
            system.status = 'initialized';
            this.initializedSystems.add(name);
            console.log(`✅ System ${name} initialized successfully`);
            
            return true;

        } catch (error) {
            console.error(`❌ Failed to initialize system ${name}:`, error);
            const system = this.systems.get(name);
            if (system) {
                system.status = 'failed';
            }
            throw error;
        }
    }

    // 모든 시스템 초기화
    async initializeAll() {
        try {
            console.log('🚀 Starting system initialization...');
            this.isInitializing = true;

            for (const [name] of this.systems) {
                await this.initializeSystem(name);
            }

            console.log('✅ All systems initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ System initialization failed:', error);
            return false;
        } finally {
            this.isInitializing = false;
        }
    }

    // 시스템 상태 확인
    getSystemStatus(name) {
        const system = this.systems.get(name);
        return system ? system.status : 'not_registered';
    }

    // 모든 시스템 상태 확인
    getAllSystemStatus() {
        const status = {};
        for (const [name] of this.systems) {
            status[name] = this.getSystemStatus(name);
        }
        return status;
    }

    // 시스템 재시작
    async restartSystem(name) {
        try {
            console.log(`🔄 Restarting system: ${name}`);
            
            // 시스템 제거
            this.initializedSystems.delete(name);
            const system = this.systems.get(name);
            if (system) {
                system.status = 'registered';
            }
            
            // 재초기화
            await this.initializeSystem(name);
            console.log(`✅ System ${name} restarted successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to restart system ${name}:`, error);
            throw error;
        }
    }
}

// 전역 시스템 관리자 생성
window.systemManager = new SystemManager();

console.log('✅ System Manager loaded');
