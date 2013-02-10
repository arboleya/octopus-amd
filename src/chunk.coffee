class Chunk

  @chunks = {}
  @chunks_list = []

  type: null

  id: null
  deps: null
  factory: null
  non_amd: null
  factored: null

  constructor:( @type, @id, @deps, @factory, @non_amd = false )->
    if @id? and @id[0] is ':'
      @id = (@id.substr 1)

    Chunk.chunks_list.unshift @

  # notify all loaded-but-not-yet-executed chunks that a new file has
  # finish loading, so the execution can occur
  @notify_all = ( loaded )->
    for chunk in @chunks_list
      chunk.exec loaded

  @reorder:( cycling = false) ->

    # looping through all chunks
    for chunk, chunk_index in @chunks_list

      # if theres no dependencies, go to next chunk
      continue if !chunk.deps.length
      
      # otherwise loop thourgh all chunk deps
      for dep, dep_index in chunk.deps

        # skip plain js's
        continue if dep[0] is ':'

        # gets dependency index
        dep_chunk_index = @_get_index_by_id dep

        # continue if the dependency was already initialized
        continue if dep_chunk_index? and dep_chunk_index < chunk_index

        # otherwise if it's found at least
        dep_chunk = @chunks_list[dep_chunk_index]
        if dep_chunk?

          # checks for circular dependency loops
          if dep_chunk.deps.length and (chunk.id in dep_chunk.deps)

            # and if there's one, remove it from the dependencies
            chunk.deps.splice dep_index, 1

            # then prints a error message and continue
            msg = "Circular dependency found between '#{chunk.id}' and "
            msg += "'#{dep_chunk.id}'"
            console.error msg

            continue

          # otherwise if no circular dependency is found, reorder
          # the specific dependency and run reorder recursively
          # until everything is beautiful
          else

            cl = @chunks_list
            cl.splice chunk_index, 0, (cl.splice dep_chunk_index, 1)[0]

            return @reorder true

  @_get_index_by_id:( id )->
    for chunk, index in @chunks_list
      return index if chunk.id is id
    return null

  # execute the factory method and stores it in a `factored` property
  exec:( loaded )->

    # if was already factored, just returns it
    return @factored if @factored?

    # abort if dependencies hasn't finish loading
    return unless @_is_subtree_loaded()

    # abort if there's no factory function/object reference
    return unless @factory?

    # loop through all dependencies
    refs = []
    for dep in @deps

      if dep[0] is ':'
        continue

      # collects the factored ref
      current = Chunk.chunks[ dep ]
      mod = current.exec( loaded )
      if mod?
        refs.push mod

    # if factory is a method, execute it and keep the returned ref
    if @factory instanceof Function
      @execd = true if @type is 'require'
      @factored = @factory.apply null, refs

    # otherwise if it's a object literal, just stores it
    else if typeof @factory is 'object'
      @factored = @factory

    return @factored

  # checks if all sub deps for this item has finish loading
  _is_subtree_loaded:->
    status = true
    for dep in @deps

      dep = dep.substr 1 if dep[0] is ':'

      if Chunk.chunks[ dep ]?
        dep = Chunk.chunks[ dep ]
        if dep.factored is null and dep.non_amd is false
          return false
      else
        return false

    return status