import Config

config :ledger, Ledger.Repo,
  database: Path.expand("../ledger_staging.db", __DIR__),
  stacktrace: true,
  show_sensitive_data_on_connection_error: true

config :ledger, LedgerWeb.Endpoint, cache_static_manifest: "priv/angular/browser/cache_manifest.json"

config :ledger, LedgerWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4003],
  secret_key_base: "Jmvka0Jw94kg8ZkjyK4T8iVl2vARvSGTe/OwyKG0eUc2wSoL+Rx8E/7mlcpVfZPM"

config :swoosh, :api_client, false
