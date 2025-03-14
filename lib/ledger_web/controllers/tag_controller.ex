defmodule LedgerWeb.TagController do
  use LedgerWeb, :controller

  alias Ledger.Tags
  alias Ledger.Tags.Tag

  action_fallback LedgerWeb.FallbackController

  def index(conn, _params) do
    tags = Tags.list_tags()
    render(conn, :index, tags: tags)
  end

  def create(conn, %{"tag" => tag_params}) do
    with {:ok, %Tag{} = tag} <- Tags.create_tag(tag_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/tags/#{tag}")
      |> render(:show, tag: tag)
    end
  end

  def show(conn, %{"id" => id}) do
    tag = Tags.get_tag!(id)
    render(conn, :show, tag: tag)
  end

  def update(conn, %{"id" => id, "tag" => tag_params}) do
    tag = Tags.get_tag!(id)

    with {:ok, %Tag{} = tag} <- Tags.update_tag(tag, tag_params) do
      render(conn, :show, tag: tag)
    end
  end

  def delete(conn, %{"id" => id}) do
    tag = Tags.get_tag!(id)

    with {:ok, %Tag{}} <- Tags.delete_tag(tag) do
      send_resp(conn, :no_content, "")
    end
  end

  def autocomplete(conn, %{"name" => name}) do
    tags = Tags.autocomplete_name(name)
    render(conn, :index, tags: tags)
  end
end
