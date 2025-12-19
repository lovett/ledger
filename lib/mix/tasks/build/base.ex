defmodule Mix.Tasks.Build.Base do
  @shortdoc "Build the image defined by Containerfile-base"

  @moduledoc """
  The base image is a minor modification to an official Fedora image
  that sets the default locale to UTF-8.

  By default, UTF-8 is not available and server startup produces
  the following warnings:

  > sh: warning: setlocale: LC_ALL: cannot change locale (en_US.UTF-8):
  > No such file or directory

  > warning: the VM is running with native name encoding of latin1 which
  > may cause Elixir to malfunction as it expects utf8. Please ensure
  > your locale is set to UTF-8 (which can be verified by running
  > "locale" in your shell) or set the ELIXIR_ERL_OPTIONS="+fnu"
  > environment variable

  The base image is built separately from the application image so that
  can happen less frequently and not drag application build time.

  Once the base image has been built, the application image is built with:

  ```
  mix build.app
  ```

  """
  use Mix.Task

  def run([]) do
    from = "registry.fedoraproject.org/fedora-minimal:43"
    System.cmd("podman", [
      "build",
      "--from=#{from}",
      "--inherit-labels=false",
      "-f=Containerfile-base",
      "-t=ledger-base",
	  "--label",
      "org.opencontainers.image.base.name=#{from}",
      "."
    ],
               into: IO.stream(),
               stderr_to_stdout: true
    )

    System.cmd("podman", [
      "image",
      "prune",
      "-f"
    ],
               into: IO.stream(),
               stderr_to_stdout: true
    )
  end
end
