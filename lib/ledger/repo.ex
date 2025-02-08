defmodule Ledger.Repo do
  use Ecto.Repo,
    otp_app: :ledger,
    adapter: Ecto.Adapters.SQLite3
end
