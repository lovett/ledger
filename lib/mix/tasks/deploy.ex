defmodule Mix.Tasks.Deploy do
  @shortdoc "Publish and run the application container"

  @moduledoc """
  Run this task after `mix build.app` to perform a 2-step deployment.

  Two environment variables are required:
    - LEDGER_CONTAINER_REGISTRY: The destination for `podman push`
    - LEDGER_REMOTE_HOST: The place to run `podman pull`

  Step one is to get the local application image over to the
  designated container registry.

  Step two is to bring that pushed image onto the host that will run
  it, offloading the majority of the work to Podman Quadlet and systemd.

  There are 2 files not accounted for here that should be manually provisioned
  on the container host.

  The Quadlet container file (see priv/quadlet/ledger.container)
  sources environment variables from `/etc/ledger.vars`. This file
  should define the things that Phoenix needs to run: DATABASE_PATH,
  PHX_HOST, PORT, and SECRET_KEY_BASE.

  Use `mix phx.gen.secret` to get a value for SECRET_KEY_BASE.

  DATABASE_PATH is relative to the container filesystem and should be
  `/data/ledger.db` or similar.

  The container file specifies `Image=ledger.image`. This file defines
  the registry the application image can be pulled from. Create
  `/etc/containers/systemd/ledger.image` and populate it with:

  ```
  [Image]
  Image=my-container-registry.example.com/myusername/ledger:latest
  ```

  If the registry runs on the same host and is itself a container, add:

  ```
  [Unit]
  After=my-container-registry.container
  Requires=my-container-registry.container
  ```

  """

  @podman_auth_path ".config/containers/auth.json"

  use Mix.Task

  def run([]) do
    run(["prod"])
  end

  def run([mix_env]) do
    container_registry = System.get_env("LEDGER_CONTAINER_REGISTRY")
    remote_host = System.get_env("LEDGER_REMOTE_HOST")

    if is_nil(container_registry) do
      IO.puts(:stderr, "LEDGER_CONTAINER_REGISTRY is not set. Cannot continue.")
      exit(:missing_env)
    end

    if is_nil(remote_host) do
      IO.puts(:stderr, "LEDGER_REMOTE_HOST is not set. Cannot continue.")
      exit(:missing_env)
    end

    home = System.get_env("HOME")
    local_auth_path = "#{home}/#{@podman_auth_path}"
    remote_auth_path = "/root/#{@podman_auth_path}"

    version = Application.spec(:ledger, :vsn)
    |> List.to_string()
    |> String.replace("+", ".")

    # This version tag is just for reference.
    System.cmd("podman", [
      "push",
      "--authfile",
      local_auth_path,
      "ledger:#{mix_env}-#{version}",
      "#{container_registry}/ledger:#{mix_env}-#{version}",
    ],
               into: IO.stream(),
               stderr_to_stdout: true
    )

    # The latest tag is what is referenced by the Quadlet file.
    System.cmd("podman", [
      "push",
      "--authfile",
      local_auth_path,
      "ledger:#{mix_env}-#{version}",
      "#{container_registry}/ledger:latest",
    ],
               into: IO.stream(),
               stderr_to_stdout: true
    )

    System.cmd(
      "rsync",
      [
        "-a",
        "-v",
        "--rsync-path=sudo rsync",
        "priv/quadlet/",
        "#{remote_host}:/etc/containers/systemd"
      ],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd(
      "ssh",
      [remote_host, "sudo systemctl daemon-reload"],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd(
      "ssh",
      [remote_host, "sudo podman pull --authfile=#{remote_auth_path} ledger"],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    System.cmd(
      "ssh",
      [remote_host, "sudo systemctl restart ledger"],
      into: IO.stream(),
      stderr_to_stdout: true
    )
  end
end
