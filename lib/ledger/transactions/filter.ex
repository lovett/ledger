defmodule Ledger.Transactions.TransactionFilter do
  alias Ledger.Accounts.Account

  @derive Jason.Encoder
  defstruct account: %Account{}, tag: "", search: "", offset: 0, limit: 50, account_scope: "all"
end
