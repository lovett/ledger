defmodule Ledger.Drafts do
  @moduledoc """
  The Drafts context.
  """

  import Ecto.Query, warn: false
  alias Ledger.Repo

  alias Ledger.Drafts.Draft

  @doc """
  Returns the list of drafts.

  ## Examples

      iex> list_drafts()
      [%Draft{}, ...]

  """
  def list_drafts do
    Repo.all from d in Draft,
                  select: [
                    :id,
                    :source,
                    :initial_content,
                    :transformed_content,
                    :transformation_type,
                    :transformation_count,
                    :percent_complete,
                    :content_id,
                    :inserted_at,
                    :updated_at,
                  ],
               order_by: [desc: :id]
  end

  @doc """
  Returns a list of that are ready for or in the process of being transformed.

  ## Examples

      iex> list_pickups()
      [%Draft{}, ...]

  """
  def list_pickups(iteration_cutoff \\ 10) do
    Repo.all from d in Draft,
                  select: [
                    :id,
                    :source,
                    :initial_content,
                    :transformed_content,
                    :transformation_type,
                    :transformation_count,
                    :percent_complete,
                    :content_id,
                    :inserted_at,
                    :updated_at,
                  ],
                  where: d.percent_complete < 100,
                  where: d.transformation_count < ^iteration_cutoff,
                  order_by: [desc: :id]
  end

  @doc """
  Count the number of available drafts.

  ## Examples

      iex> count_drafts()
      123
  """
  def count() do
    Repo.one(from d in Draft, select: count())
  end

  @doc """
  Gets a single draft.

  Raises `Ecto.NoResultsError` if the Draft does not exist.

  ## Examples

      iex> get_draft!(123)
      %Draft{}

      iex> get_draft!(456)
      ** (Ecto.NoResultsError)

  """
  def get_draft!(id), do: Repo.get!(Draft, id)

  @doc """
  Creates a draft.

  ## Examples

      iex> create_draft(%{field: value})
      {:ok, %Draft{}}

      iex> create_draft(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_draft(attrs \\ %{}) do
    %Draft{}
    |> Draft.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a draft.

  ## Examples

      iex> update_draft(draft, %{field: new_value})
      {:ok, %Draft{}}

      iex> update_draft(draft, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_draft(%Draft{} = draft, attrs) do
    draft
    |> Draft.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a draft.

  ## Examples

      iex> delete_draft(draft)
      {:ok, %Draft{}}

      iex> delete_draft(draft)
      {:error, %Ecto.Changeset{}}

  """
  def delete_draft(%Draft{} = draft) do
    Repo.delete(draft)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking draft changes.

  ## Examples

      iex> change_draft(draft)
      %Ecto.Changeset{data: %Draft{}}

  """
  def change_draft(%Draft{} = draft, attrs \\ %{}) do
    Draft.changeset(draft, attrs)
  end
end
