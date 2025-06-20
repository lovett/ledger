defmodule Ledger.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Ledger.Accounts` context.
  """

  @doc """
  Generate a unique account name.
  """
  def unique_account_name, do: "some name#{System.unique_integer([:positive])}"

  @doc """
  Generate a account.
  """
  def account_fixture(attrs \\ %{}) do
    {:ok, account} =
      attrs
      |> Enum.into(%{
        closed_on: nil,
        logo: nil,
        logo_mime: nil,
        logo_hash: nil,
        name: unique_account_name(),
        note: nil,
        opened_on: ~D[2025-01-01],
        url: nil
      })
      |> Ledger.Accounts.create_account()

    account
  end
end
