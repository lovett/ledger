defmodule LedgerWeb.TransactionController do
  use LedgerWeb, :controller

  alias Ledger.Transactions
  alias Ledger.Accounts;
  alias Ledger.Transactions.Transaction

  action_fallback LedgerWeb.FallbackController

  def index(conn, params) do
    offset = Map.get(params, "offset", 0)
    account = Map.get(params, "account", 0)
    limit = 100
    transactions = Transactions.list_transactions(account, offset, limit)
    count = Transactions.count_transactions(account)
    title = page_title(account)
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

  def page_title(account_id \\ 0) do
    if (account_id == 0) do
      "Transactions"
    else
      account = Accounts.get_account!(account_id)
      "#{account.name} Transactions"
    end
  end
end
