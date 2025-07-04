defmodule LedgerWeb.DraftController do
  use LedgerWeb, :controller

  alias Ledger.Drafts
  alias Ledger.Drafts.Draft

  action_fallback LedgerWeb.FallbackController

  def index(conn, _params) do
    drafts = Drafts.list_drafts()
    render(conn, :index, drafts: drafts)
  end

  def create(conn, %{"draft" => draft_params}) do
    with {:ok, %Draft{} = draft} <- Drafts.create_draft(draft_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/drafts/#{draft}")
      |> render(:show, draft: draft)
    end
  end

  def show(conn, %{"id" => id}) do
    draft = Drafts.get_draft!(id)
    render(conn, :show, draft: draft)
  end

  def count(conn, _params) do
    render(conn, :count, count: Drafts.count())
  end

  def pickups(conn, _params) do
    drafts = Drafts.list_pickups()
    render(conn, :index, drafts: drafts)
  end

  def update(conn, %{"id" => id, "draft" => draft_params}) do
    draft = Drafts.get_draft!(id)

    with {:ok, %Draft{} = draft} <- Drafts.update_draft(draft, draft_params) do
      render(conn, :show, draft: draft)
    end
  end

  def delete(conn, %{"id" => id}) do
    draft = Drafts.get_draft!(id)

    with {:ok, %Draft{}} <- Drafts.delete_draft(draft) do
      send_resp(conn, :no_content, "")
    end
  end
end
