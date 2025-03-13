defmodule LedgerWeb.AccountJSON do
  alias Ledger.Accounts.Account

  @doc """
  Renders a list of accounts.
  """
  def index(%{accounts: accounts}) do
    %{data: for(account <- accounts, do: data(account))}
  end

  @doc """
  Renders a single account.
  """
  def show(%{account: account}) do
    %{data: data(account)}
  end

  defp data(%Account{} = account) do
    %{
      id: account.id,
      name: account.name,
      opened_on: account.opened_on,
      closed_on: account.closed_on,
      url: account.url,
      note: account.note,
      logo_mime: account.logo_mime,
      balance: account.balance,
      withdrawl_count: account.withdrawl_count,
      deposit_count: account.deposit_count,
    }
  end
end
