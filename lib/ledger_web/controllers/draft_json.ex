defmodule LedgerWeb.DraftJSON do
  alias Ledger.Drafts.Draft

  @doc """
  Renders a list of drafts.
  """
  def index(%{drafts: drafts}) do
    %{data: for(draft <- drafts, do: data(draft))}
  end

  @doc """
  Renders a single draft.
  """
  def show(%{draft: draft}) do
    %{data: data(draft)}
  end

  def count(%{count: count}) do
    count
  end

  defp data(%Draft{} = draft) do
    %{
      id: draft.id,
      source: draft.source,
      initial_content: draft.initial_content,
      transformed_content: draft.transformed_content,
      transformation_type: draft.transformation_type,
      transformation_count: draft.transformation_count,
      percent_complete: draft.percent_complete,
      content_id: draft.content_id,
      inserted_at: draft.inserted_at,
      updated_at: draft.updated_at,
    }
  end
end
