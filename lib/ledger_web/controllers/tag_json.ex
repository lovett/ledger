defmodule LedgerWeb.TagJSON do
  alias Ledger.Tags.Tag

  @doc """
  Renders a list of tags.
  """
  def index(%{tags: tags}) do
    %{data: tags}
#for(tag <- tags, do: data(tag))}
  end

  @doc """
  Renders a single tag.
  """
  def show(%{tag: tag}) do
    %{data: data(tag)}
  end

  defp data(%Tag{} = tag) do
    IO.inspect(tag, label: "tag")
    %{
      id: tag.id,
      name: tag.name,
      transaction_count: tag.transaction_count
    }
  end
end
