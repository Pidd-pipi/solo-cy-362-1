# 剧本杀门店运营管理系统

面向剧本杀线下门店，提供剧本库管理、场次排期、玩家组局、DM排班和会员运营等一站式门店运营工具。

## Docker Compose 快速启动

首次启动前复制环境变量文件：

```bash
cp .env.example .env
docker compose up -d
```

访问地址：

- 前端：http://localhost:28502
- 后端健康检查：http://localhost:29502/health
- API 示例：http://localhost:28502/api/overview

## 项目主要功能

- 剧本库与DM管理：录入剧本信息（名称、类型、难度、时长、人数、主持人DM要求），上传剧本封面与简介，关联专属DM主持人，支持按标签筛选与搜索。
- 场次排期与拼车位：门店设置每日开放场次时段（如14:00场、19:00场），每场显示已报名人数和剩余空位，玩家可单人报名加入拼车位或自行组满局。
- 玩家组局与角色分配：满局后DM可为玩家分配角色，支持随机分配与手动调整，系统记录每次组局玩家名单与角色分配结果。
- 会员积分与等级体系：注册会员消费积累积分，设置等级规则（如青铜/白银/黄金/钻石），不同等级享受折扣与优先拼车位权益，积分可兑换周边或抵扣费用。
- 营收与上座率分析：管理员查看每日/周/月营收报表、各剧本上座率排行、DM带本场次与评分统计，支持导出营业数据。

## 本地开发方式

前端：

```bash
cd frontend
npm install
npm run dev
```

后端：

```bash
cd backend
mvn spring-boot:run
```

## 技术栈

| 分层 | 技术 |
| --- | --- |
| 前端 | Vue 3 + TypeScript、Element Plus、Vite |
| 后端 | Spring Boot + Java |
| 数据库 | PostgreSQL |
| 认证 | JWT |
| 依赖 | MyBatis、Maven |

## 项目目录结构

```text
.
├── backend/              # 后端服务
├── database/             # 数据库脚本
├── frontend/             # 前端应用
├── docker-compose.yml    # 一键部署编排
├── .env.example          # 环境变量示例
└── README.md
```

## 环境变量说明

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| COMPOSE_PROJECT_NAME | Compose 项目名，避免中文目录名导致项目名为空 | ldmurdergame |
| DB_NAME | 数据库名称 | app |
| DB_USER | 数据库用户 | app |
| DB_PASSWORD | 数据库密码 | app_pwd |
| DB_ROOT_PASSWORD | 数据库 root 密码 | root_pwd |
| JWT_SECRET | JWT 签名密钥 | change_me_to_a_long_random_string |
| FRONTEND_PORT | 前端宿主机端口 | 28502 |
| BACKEND_PORT | 后端宿主机端口 | 29502 |
| DB_PORT | 数据库宿主机端口 | 5432 |

## Docker 部署说明

- 使用 `docker compose up -d` 启动，不需要额外传入 `-p`。
- `docker-compose.yml` 顶层已声明 `name: ldmurdergame`，并且 `.env` 包含 `COMPOSE_PROJECT_NAME=ldmurdergame`，可在中文目录名下启动。
- 数据库数据保存在命名卷 `db_data` 中，不依赖当前目录名。
- 前端容器由 Nginx 托管静态资源，并把 `/api/` 反向代理到 `backend:29502`。
- 若本地端口冲突，可修改 `.env` 中的 `FRONTEND_PORT`、`BACKEND_PORT`、`DB_PORT`。

常用命令：

```bash
docker compose config --quiet
docker compose ps
docker compose down
```

## License

MIT
