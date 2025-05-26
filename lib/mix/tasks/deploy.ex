defmodule Mix.Tasks.Deploy do
  @shortdoc "Publish and run the application container"

  @moduledoc """
  Run this task after `mix build.app` to perform a 2-step deployment.

  Two arguments are required:
    - container_registry: The destination for `podman push`
    - remote_host: The place to run `podman pull`

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

  """

  use Mix.Task

  def run([container_registry, remote_host]) do
    run(["prod", container_registry, remote_host])
  end

  def run([mix_env, container_registry, remote_host]) do
    version = Application.spec(:ledger, :vsn)
    |> List.to_string()
    |> String.replace("+", ".")

    # This version tag is just for reference.
    System.cmd("podman", [
      "push",
      "ledger:#{mix_env}-#{version}",
      "#{container_registry}/ledger:#{mix_env}-#{version}",
    ],
      into: IO.stream(),
      stderr_to_stdout: true
    )

    # The latest tag is what is referenced by the Quadlet file.
    System.cmd("podman", [
      "push",
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
      [remote_host, "sudo podman pull ledger"],
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
