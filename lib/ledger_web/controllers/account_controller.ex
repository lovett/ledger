defmodule LedgerWeb.AccountController do
  use LedgerWeb, :controller

  alias Ledger.Accounts
  alias Ledger.Transactions
  alias Ledger.Accounts.Account

  action_fallback LedgerWeb.FallbackController

  def index(conn, _params) do
    balances = Transactions.list_balances()
    pending_balances = Transactions.list_pending_balances()
    future_balances = Transactions.list_future_balances()
    final_balances = Transactions.list_final_balances()
    deposit_counts = Transactions.count_deposits()
    withdrawl_counts = Transactions.count_withdrawls()
    accounts = Accounts.list_accounts()
    |> Enum.map(fn account -> %{account | balance: Map.get(balances, account.id, 0)} end)
    |> Enum.map(fn account -> %{account | balance_pending: Map.get(pending_balances, account.id, 0)} end)
    |> Enum.map(fn account -> %{account | balance_future: Map.get(future_balances, account.id, 0)} end)
    |> Enum.map(fn account -> %{account | balance_final: Map.get(final_balances, account.id, 0)} end)
    |> Enum.map(fn account -> %{account | deposit_count: Map.get(deposit_counts, account.id, 0)} end)
    |> Enum.map(fn account -> %{account | withdrawl_count: Map.get(withdrawl_counts, account.id, 0)} end)

    render(conn, :index, accounts: accounts)
  end

  def create(conn, %{"account" => account_params}) do
    with {:ok, %Account{} = account} <- Accounts.create_account(account_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/accounts/#{account}")
      |> render(:show, account: account)
    end
  end

  def show(conn, %{"id" => id}) do
    account = Accounts.get_account!(id)
    |> Map.put(:deposit_count, Transactions.count_deposits(id))
    |> Map.put(:withdrawl_count, Transactions.count_withdrawls(id))
    render(conn, :show, account: account)
  end

  def update(conn, %{"id" => id, "account" => account_params}) do
    account = Accounts.get_account!(id)

    updates = account_params
    |> Map.put_new("opened_on", nil)
    |> Map.put_new("closed_on", nil)
    |> discard_existing_logo()
    |> merge_logo_fields()

    with {:ok, %Account{} = _} <- Accounts.update_account(account, updates) do
      send_resp(conn, :no_content, "")
    end
  end

  def delete(conn, %{"id" => id}) do
    account = Accounts.get_account!(id)

    with {:ok, %Account{}} <- Accounts.delete_account(account) do
      send_resp(conn, :no_content, "")
    end
  end

  def merge_logo_fields(%{"logo_upload" => %Plug.Upload{} = logo_upload} = account_params) do
    case File.read(logo_upload.path) do
      {:ok, contents} ->
        account_params
        |> Map.put("logo_mime", logo_upload.content_type)
        |> Map.put("logo_hash", logo_hash(contents))
        |> Map.put("logo", contents)
      {:error, reason} ->
        IO.inspect(reason, label: "logo upload error")
        account_params
    end
  end

  def merge_logo_fields(account_params), do: account_params

  def discard_existing_logo(%{"existing_logo_action" => "discard"} = account_params) do
    account_params
    |> Map.put("logo_mime", nil)
    |> Map.put("logo_hash", nil)
    |> Map.put("logo", nil)
  end

  def discard_existing_logo(account_params), do: account_params

  defp logo_hash(contents) do
    :crypto.hash(:md5, contents)
    |> Base.encode16()
    |> String.downcase()
  end
end
