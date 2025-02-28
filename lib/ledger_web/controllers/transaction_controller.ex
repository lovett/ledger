defmodule LedgerWeb.TransactionController do
  use LedgerWeb, :controller

  alias Ledger.Transactions
  alias Ledger.Accounts;
  alias Ledger.Transactions.Transaction

  action_fallback LedgerWeb.FallbackController

  def index(conn, params) do
    offset = String.to_integer(Map.get(params, "offset", "0"))
    account_id = String.to_integer(Map.get(params, "account_id", "0"))
    query = Map.get(params, "query", "")
    limit = 100
    transactions = Transactions.list_transactions(account_id, query, offset, limit)
    count = Transactions.count_transactions(account_id, query)
    title = page_title(account_id, query)
    render(conn, :index, transactions: transactions, count: count, offset: offset, title: title)
  end

  def create(conn, %{"transaction" => transaction_params}) do
    with {:ok, %Transaction{} = transaction} <- Transactions.create_transaction(transaction_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/transactions/#{transaction}")
      |> render(:show, transaction: transaction)
    end
  end

  def show(conn, %{"id" => id}) do
    transaction = Transactions.get_transaction!(id)
    render(conn, :show, transaction: transaction)
  end

  def update(conn, %{"id" => id, "transaction" => transaction_params}) do
    transaction = Transactions.get_transaction!(id)

    with {:ok, %Transaction{} = transaction} <- Transactions.update_transaction(transaction, transaction_params) do
      render(conn, :show, transaction: transaction)
    end
  end

  def delete(conn, %{"id" => id}) do
    transaction = Transactions.get_transaction!(id)

    with {:ok, %Transaction{}} <- Transactions.delete_transaction(transaction) do
      send_resp(conn, :no_content, "")
    end
  end

  @spec page_title(account_id:: integer, query:: String.t()):: String.t()
  def page_title(account_id \\ 0, query \\ "") do
    account = if (account_id == 0), do: nil, else: Accounts.get_account!(account_id)

    has_query = String.trim(query) != ""

    cond do
      account && has_query -> "Transaction Search Results in #{account.name}"
      account -> "#{account.name} Transactions"
      has_query  -> "Transaction Search Results"
      true -> "Transactions"
    end
  end
end
