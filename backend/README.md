# FastAPI Project - Backend

## Requirements

* [Docker](https://www.docker.com/).
* [uv](https://docs.astral.sh/uv/) for Python package and environment management.

## Docker Compose

Start the local development environment with Docker Compose following the guide in [../development.md](../development.md).

## General Workflow

By default, the dependencies are managed with [uv](https://docs.astral.sh/uv/), go there and install it.

From `./backend/` you can install all the dependencies with:

```console
$ uv sync
```

Then you can activate the virtual environment with:

```console
$ source .venv/bin/activate
```

Make sure your editor is using the correct Python virtual environment, with the interpreter at `backend/.venv/bin/python`.

Modify or add SQLModel models for data and SQL tables in `./backend/app/models.py`, API endpoints in `./backend/app/api/`, CRUD (Create, Read, Update, Delete) utils in `./backend/app/crud.py`.

## VS Code

There are already configurations in place to run the backend through the VS Code debugger, so that you can use breakpoints, pause and explore variables, etc.

The setup is also already configured so you can run the tests through the VS Code Python tests tab.

## Docker Compose Override

During development, you can change Docker Compose settings that will only affect the local development environment in the file `docker-compose.override.yml`.

The changes to that file only affect the local development environment, not the production environment. So, you can add "temporary" changes that help the development workflow.

For example, the directory with the backend code is synchronized in the Docker container, copying the code you change live to the directory inside the container. That allows you to test your changes right away, without having to build the Docker image again. It should only be done during development, for production, you should build the Docker image with a recent version of the backend code. But during development, it allows you to iterate very fast.

There is also a command override that runs `fastapi run --reload` instead of the default `fastapi run`. It starts a single server process (instead of multiple, as would be for production) and reloads the process whenever the code changes. Have in mind that if you have a syntax error and save the Python file, it will break and exit, and the container will stop. After that, you can restart the container by fixing the error and running again:

```console
$ docker compose watch
```

There is also a commented out `command` override, you can uncomment it and comment the default one. It makes the backend container run a process that does "nothing", but keeps the container alive. That allows you to get inside your running container and execute commands inside, for example a Python interpreter to test installed dependencies, or start the development server that reloads when it detects changes.

To get inside the container with a `bash` session you can start the stack with:

```console
$ docker compose watch
```

and then in another terminal, `exec` inside the running container:

```console
$ docker compose exec backend bash
```

You should see an output like:

```console
root@7f2607af31c3:/app#
```

that means that you are in a `bash` session inside your container, as a `root` user, under the `/app` directory, this directory has another directory called "app" inside, that's where your code lives inside the container: `/app/app`.

There you can use the `fastapi run --reload` command to run the debug live reloading server.

```console
$ fastapi run --reload app/main.py
```

...it will look like:

```console
root@7f2607af31c3:/app# fastapi run --reload app/main.py
```

and then hit enter. That runs the live reloading server that auto reloads when it detects code changes.

Nevertheless, if it doesn't detect a change but a syntax error, it will just stop with an error. But as the container is still alive and you are in a Bash session, you can quickly restart it after fixing the error, running the same command ("up arrow" and "Enter").

...this previous detail is what makes it useful to have the container alive doing nothing and then, in a Bash session, make it run the live reload server.

## Backend tests

To test the backend run:

```console
$ bash ./scripts/test.sh
```

The tests run with Pytest, modify and add tests to `./backend/app/tests/`.

If you use GitHub Actions the tests will run automatically.

### Test running stack

If your stack is already up and you just want to run the tests, you can use:

```bash
docker compose exec backend bash scripts/tests-start.sh
```

That `/app/scripts/tests-start.sh` script just calls `pytest` after making sure that the rest of the stack is running. If you need to pass extra arguments to `pytest`, you can pass them to that command and they will be forwarded.

For example, to stop on first error:

```bash
docker compose exec backend bash scripts/tests-start.sh -x
```

### Test Coverage

When the tests are run, a file `htmlcov/index.html` is generated, you can open it in your browser to see the coverage of the tests.

## Migrations

As during local development your app directory is mounted as a volume inside the container, you can also run the migrations with `alembic` commands inside the container and the migration code will be in your app directory (instead of being only inside the container). So you can add it to your git repository.

Make sure you create a "revision" of your models and that you "upgrade" your database with that revision every time you change them. As this is what will update the tables in your database. Otherwise, your application will have errors.

* Start an interactive session in the backend container:

```console
$ docker compose exec backend bash
```

* Alembic is already configured to import your SQLModel models from `./backend/app/models.py`.

* After changing a model (for example, adding a column), inside the container, create a revision, e.g.:

```console
$ alembic revision --autogenerate -m "Add column last_name to User model"
```

* Commit to the git repository the files generated in the alembic directory.

* After creating the revision, run the migration in the database (this is what will actually change the database):

```console
$ alembic upgrade head
```

If you don't want to use migrations at all, uncomment the lines in the file at `./backend/app/core/db.py` that end in:

```python
SQLModel.metadata.create_all(engine)
```

and comment the line in the file `scripts/prestart.sh` that contains:

```console
$ alembic upgrade head
```

If you don't want to start with the default models and want to remove them / modify them, from the beginning, without having any previous revision, you can remove the revision files (`.py` Python files) under `./backend/app/alembic/versions/`. And then create a first migration as described above.

## Email Templates

The email templates are in `./backend/app/email-templates/`. Here, there are two directories: `build` and `src`. The `src` directory contains the source files that are used to build the final email templates. The `build` directory contains the final email templates that are used by the application.

Before continuing, ensure you have the [MJML extension](https://marketplace.visualstudio.com/items?itemName=attilabuti.vscode-mjml) installed in your VS Code.

Once you have the MJML extension installed, you can create a new email template in the `src` directory. After creating the new email template and with the `.mjml` file open in your editor, open the command palette with `Ctrl+Shift+P` and search for `MJML: Export to HTML`. This will convert the `.mjml` file to a `.html` file and now you can save it in the build directory.

# 常见启动与环境变量问题总结

本项目在开发和部署过程中，常见的出错问题及解决方法如下：

## 1. 虚拟环境路径错误
- **现象**：报错 `zsh: no such file or directory: .venv/bin/python`
- **原因**：在项目根目录（rabbit_admin）下运行了 `.venv/bin/python`，但虚拟环境实际在 `backend/.venv/` 目录下。
- **解决方法**：
  - 进入 backend 目录后再运行：
    ```bash
    cd backend
    .venv/bin/python ...
    ```

## 2. ModuleNotFoundError: No module named 'app'
- **现象**：运行初始化脚本时报错 `ModuleNotFoundError: No module named 'app'`
- **原因**：PYTHONPATH 没有设置，Python 找不到 app 包。
- **解决方法**：
  - 运行脚本时加上 `PYTHONPATH=$PYTHONPATH:.`，例如：
    ```bash
    PYTHONPATH=$PYTHONPATH:. .venv/bin/python app/initial_data.py
    ```

## 3. 数据库连接无密码
- **现象**：报错 `connection failed: ... fe_sendauth: no password supplied`
- **原因**：环境变量 `POSTGRES_PASSWORD` 没有正确传递到 FastAPI 进程。
- **解决方法**：
  - 启动服务前，**在同一个 shell** 里依次 export 所有数据库相关环境变量。
  - 推荐顺序：
    ```bash
    cd backend
    export POSTGRES_SERVER=localhost
    export POSTGRES_USER=postgres
    export POSTGRES_PASSWORD=xxxxxx
    export POSTGRES_DB=app
    export POSTGRES_PORT=5432
    export PROJECT_NAME="FastAPI Project"
    export FIRST_SUPERUSER=admin@example.com
    export FIRST_SUPERUSER_PASSWORD=xxxxxx
    .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
  - 启动前可用 `echo $POSTGRES_PASSWORD` 检查变量是否生效。

## 4. 数据库无超级用户导致登录 500
- **现象**：登录接口 `/api/v1/login/access-token` 返回 500 错误。
- **原因**：数据库 user 表没有超级用户数据。
- **解决方法**：
  - 运行初始化脚本：
    ```bash
    PYTHONPATH=$PYTHONPATH:. .venv/bin/python app/initial_data.py
    ```
  - 确认 user 表有 admin@example.com 账号。

## 5. ORM 关系配置错误导致 500
- **现象**：启动或初始化时报错 `Mapper 'Mapper[Role(role)]' has no property 'teachers'`。
- **原因**：Role/Teacher 的 ORM 关系未正确定义。
- **解决方法**：
  - 在 Role 模型中加：
    ```python
    teachers: list["Teacher"] = Relationship(back_populates="role")
    ```

---

如遇到其它问题，建议：
- 先检查当前目录和虚拟环境路径
- 检查环境变量是否生效
- 查看后端详细报错日志
