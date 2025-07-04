defmodule LedgerWeb.DraftControllerTest do
  use LedgerWeb.ConnCase

  import Ledger.DraftsFixtures

  alias Ledger.Drafts.Draft

  @create_attrs %{
    body: "some body",
    from: "some from",
    subject: "some subject"
  }
  @update_attrs %{
    body: "some updated body",
    from: "some updated from",
    subject: "some updated subject"
  }
  @invalid_attrs %{body: nil, from: nil, subject: nil}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all drafts", %{conn: conn} do
      conn = get(conn, ~p"/api/drafts")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create draft" do
    test "renders draft when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/drafts", draft: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/drafts/#{id}")

      assert %{
               "id" => ^id,
               "body" => "some body",
               "from" => "some from",
               "subject" => "some subject"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/drafts", draft: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update draft" do
    setup [:create_draft]

    test "renders draft when data is valid", %{conn: conn, draft: %Draft{id: id} = draft} do
      conn = put(conn, ~p"/api/drafts/#{draft}", draft: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/drafts/#{id}")

      assert %{
               "id" => ^id,
               "body" => "some updated body",
               "from" => "some updated from",
               "subject" => "some updated subject"
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, draft: draft} do
      conn = put(conn, ~p"/api/drafts/#{draft}", draft: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete draft" do
    setup [:create_draft]

    test "deletes chosen draft", %{conn: conn, draft: draft} do
      conn = delete(conn, ~p"/api/drafts/#{draft}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/drafts/#{draft}")
      end
    end
  end

  defp create_draft(_) do
    draft = draft_fixture()
    %{draft: draft}
  end
end
