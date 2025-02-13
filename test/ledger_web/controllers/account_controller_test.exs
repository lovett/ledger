defmodule LedgerWeb.AccountControllerTest do
  use LedgerWeb.ConnCase

  import Ledger.AccountsFixtures

  alias Ledger.Accounts.Account

  @create_attrs %{
    name: "some name",
    url: "some url",
    opened_on: ~D[2025-01-01],
    closed_on: nil,
    note: "some note",
    logo: "some logo",
    logo_mime: "some logo_mime"
  }
  @update_attrs %{
    name: "some updated name",
    url: "some updated url",
    opened_on: ~D[2025-01-01],
    closed_on: ~D[2025-02-01],
    note: "some updated note",
    logo: "some updated logo",
    logo_mime: "some updated logo_mime"
  }
  @invalid_attrs %{name: nil, url: nil, opened_on: nil, closed_on: nil, note: nil, logo: nil, logo_mime: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all accounts", %{conn: conn} do
      conn = get(conn, ~p"/api/accounts")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create account" do
    test "renders account when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/accounts", account: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/accounts/#{id}")

      assert %{
               "id" => ^id,
               "closed_on" => nil,
               "logo" => "some logo",
               "logo_mime" => "some logo_mime",
               "name" => "some name",
               "note" => "some note",
               "opened_on" => "2025-01-01",
               "url" => "some url"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/accounts", account: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update account" do
    setup [:create_account]

    test "renders account when data is valid", %{conn: conn, account: %Account{id: id} = account} do
      conn = put(conn, ~p"/api/accounts/#{account}", account: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/accounts/#{id}")

      assert %{
               "id" => ^id,
               "closed_on" => "2025-02-01",
               "logo" => "some updated logo",
               "logo_mime" => "some updated logo_mime",
               "name" => "some updated name",
               "note" => "some updated note",
               "opened_on" => "2025-01-01",
               "url" => "some updated url"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, account: account} do
      conn = put(conn, ~p"/api/accounts/#{account}", account: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete account" do
    setup [:create_account]

    test "deletes chosen account", %{conn: conn, account: account} do
      conn = delete(conn, ~p"/api/accounts/#{account}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/accounts/#{account}")
      end
    end
  end

  defp create_account(_) do
    account = account_fixture()
    %{account: account}
  end
end
