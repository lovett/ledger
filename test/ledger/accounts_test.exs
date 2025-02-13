defmodule Ledger.AccountsTest do
  use Ledger.DataCase

  alias Ledger.Accounts

  describe "accounts" do
    alias Ledger.Accounts.Account

    import Ledger.AccountsFixtures

    @invalid_attrs %{name: nil, url: nil, opened_on: nil, closed_on: nil, note: nil, logo: nil, logo_mime: nil}

    test "list_accounts/0 returns all accounts" do
      account = account_fixture()
      assert Accounts.list_accounts() == [account]
    end

    test "get_account!/1 returns the account with given id" do
      account = account_fixture()
      assert Accounts.get_account!(account.id) == account
    end

    test "create_account/1 with valid data creates a account" do
      valid_attrs = %{name: "some name", url: "some url", opened_on: ~D[2025-02-12], closed_on: ~D[2025-02-12], note: "some note", logo: "some logo", logo_mime: "some logo_mime"}

      assert {:ok, %Account{} = account} = Accounts.create_account(valid_attrs)
      assert account.name == "some name"
      assert account.url == "some url"
      assert account.opened_on == ~D[2025-02-12]
      assert account.closed_on == ~D[2025-02-12]
      assert account.note == "some note"
      assert account.logo == "some logo"
      assert account.logo_mime == "some logo_mime"
    end

    test "create_account/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Accounts.create_account(@invalid_attrs)
    end

    test "update_account/2 with valid data updates the account" do
      account = account_fixture()
      update_attrs = %{name: "some updated name", url: "some updated url", opened_on: ~D[2025-02-13], closed_on: ~D[2025-02-13], note: "some updated note", logo: "some updated logo", logo_mime: "some updated logo_mime"}

      assert {:ok, %Account{} = account} = Accounts.update_account(account, update_attrs)
      assert account.name == "some updated name"
      assert account.url == "some updated url"
      assert account.opened_on == ~D[2025-02-13]
      assert account.closed_on == ~D[2025-02-13]
      assert account.note == "some updated note"
      assert account.logo == "some updated logo"
      assert account.logo_mime == "some updated logo_mime"
    end

    test "update_account/2 with invalid data returns error changeset" do
      account = account_fixture()
      assert {:error, %Ecto.Changeset{}} = Accounts.update_account(account, @invalid_attrs)
      assert account == Accounts.get_account!(account.id)
    end

    test "delete_account/1 deletes the account" do
      account = account_fixture()
      assert {:ok, %Account{}} = Accounts.delete_account(account)
      assert_raise Ecto.NoResultsError, fn -> Accounts.get_account!(account.id) end
    end

    test "change_account/1 returns an account changeset" do
      account = account_fixture()
      assert %Ecto.Changeset{} = Accounts.change_account(account)
    end
  end
end
