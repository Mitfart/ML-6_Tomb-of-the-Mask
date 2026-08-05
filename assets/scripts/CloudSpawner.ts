import { _decorator, Component, Prefab, Node, instantiate, NodePool, Camera, Vec3, UITransform, director, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CloudSpawner')
export class CloudSpawner extends Component {
    @property({ type: [Prefab], tooltip: 'Array of cloud prefabs to randomly spawn' })
    cloudPrefabs: Prefab[] = [];

    @property({ tooltip: 'Time in seconds between spawns' })
    spawnInterval: number = 1.5;

    @property({ tooltip: 'Movement speed (world units per second)' })
    cloudSpeed: number = 80;

    @property({ tooltip: 'Exact world X coordinate where clouds spawn' })
    spawnX: number = -500;

    @property({ tooltip: 'Minimum world Y coordinate where clouds can spawn' })
    minSpawnHeight: number = -300;

    @property({ tooltip: 'Maximum world Y coordinate where clouds can spawn' })
    maxSpawnHeight: number = 300;

    private activeClouds: Node[] = [];
    private poolMap: Map<string, NodePool> = new Map();
    private spawnTimer: number = 0;
    private mainCamera: Camera | null = null;
    private rightBound: number = 0;

    onLoad() {
        const scene = director.getScene();
        this.mainCamera = scene?.getComponentInChildren(Camera);
    }

    start() {
        for (const prefab of this.cloudPrefabs) {
            if (!prefab) continue;
            const uuid = prefab.data._uuid;
            const pool = new NodePool();
            for (let i = 0; i < 3; i++) {
                const node = instantiate(prefab);
                pool.put(node);
            }
            this.poolMap.set(uuid, pool);
        }
        this.spawnCloud();
    }

    update(dt: number) {
        if (this.cloudPrefabs.length === 0 || !this.mainCamera) return;

        this.updateRightBound();
        this.spawnTimer += dt;

        while (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer -= this.spawnInterval;
            this.spawnCloud();
        }

        this.moveAndRecycleClouds(dt);
    }

    private updateRightBound() {
        if (!this.mainCamera) return;
        const camPos = this.mainCamera.node.worldPosition;
        const orthoHeight = this.mainCamera.orthoHeight;
        const aspect = view.getVisibleSize().width / view.getVisibleSize().height;
        const halfWidth = orthoHeight * aspect;
        this.rightBound = camPos.x + halfWidth;
    }

    private getCloudNode(prefab: Prefab): Node | null {
        const uuid = prefab.data._uuid;
        let pool = this.poolMap.get(uuid);
        if (!pool) {
            pool = new NodePool();
            this.poolMap.set(uuid, pool);
        }

        let node = pool.get();
        if (!node) {
            node = instantiate(prefab);
        }

        (node as any)._prefabUuid = uuid;

        node.setScale(Vec3.ONE);
        node.setRotationFromEuler(0, 0, 0);
        node.active = true;
        return node;
    }

    private spawnCloud() {
        const prefab = this.cloudPrefabs[Math.floor(Math.random() * this.cloudPrefabs.length)];
        if (!prefab) return;

        const node = this.getCloudNode(prefab);
        if (!node) return;

        const minY = Math.min(this.minSpawnHeight, this.maxSpawnHeight);
        const maxY = Math.max(this.minSpawnHeight, this.maxSpawnHeight);
        const y = minY + Math.random() * (maxY - minY);

        node.setWorldPosition(new Vec3(this.spawnX, y, 0));
        this.node.addChild(node);
        this.activeClouds.push(node);
    }

    private moveAndRecycleClouds(dt: number) {
        const speed = this.cloudSpeed * dt;
        for (let i = this.activeClouds.length - 1; i >= 0; i--) {
            const cloud = this.activeClouds[i];
            const pos = cloud.worldPosition;
            cloud.setWorldPosition(new Vec3(pos.x + speed, pos.y, pos.z));

            const ui = cloud.getComponent(UITransform) || cloud.getComponentInChildren(UITransform);
            const cloudWidth = ui ? ui.width * cloud.scale.x : 0;
            if (pos.x - cloudWidth / 2 > this.rightBound) {
                this.activeClouds.splice(i, 1);
                cloud.removeFromParent();
                cloud.active = false;

                const prefabUuid = (cloud as any)._prefabUuid as string;
                const pool = prefabUuid ? this.poolMap.get(prefabUuid) : null;
                if (pool) {
                    pool.put(cloud);
                } else {
                    cloud.destroy();
                }
            }
        }
    }
}