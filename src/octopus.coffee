# initialize global require / define
require = -> OctopusAMD.process 'require', [].slice.call arguments
define = -> OctopusAMD.process 'define', [].slice.call arguments

# OctopusAMD class
class OctopusAMD

  @last_chunk = null
  @BASE_URL = null
  @MAP = {}

  # ...
  # configures octopus
  @config:( options )->
    @BASE_URL = options.base_url or ''
    @MAP = options.paths or {}

  # ...
  # process all require's and define's calls
  @process = ( type, params )->
    # first require is handled differently because if isn't loaded
    # like all the others
    if @last_chunk? and @last_chunk.type is 'require'
      @define_chunk 'root'

    # format params checking all possible ways
    params = @_name_params type, params

    # creates and stores a new Chunk
    chunk = new Chunk type, params.id, params.deps, params.factory
    if type is 'define' and chunk.id?
      Chunk.chunks[chunk.id] = chunk
    else
      @last_chunk = chunk

    # loop through all chunk deps and instantiate a new
    # script instance for loading it
    timeout = 0
    for dep in params.deps

      [dep_id, dep_url, is_non_amd] = @disassemble dep

      continue if Chunk.chunks[dep_id]?

      new Script dep_id, dep_url,

        # onload callback
        (id, url, is_non_amd)->
          # define the last instantiated chunk
          OctopusAMD.define_chunk id, url, is_non_amd

          # reorders all chunks
          Chunk.reorder()

          # notify everybody that a new chunk was defined
          Chunk.notify_all id

        # on error callback
        , ( e )->
          console.error e

        # timeout
        , (timeout += 1), is_non_amd

  # ...
  # disassemble an id, checks if it has some url mapped to another location,
  # if it's an amd module or a plain js and return everything.
  @disassemble:( id )->

    is_non_amd = false

    if id[0] is ':'
      is_non_amd = true
      id = id.substr 1
    
    if @MAP[id]?
      url = @MAP[id]
    else
      url = id

    unless (/^http/m.test url )
      absolute = new RegExp( "(^#{@BASE_URL.replace '/', '\\/'})" )
      unless (absolute.test url)
        url = "#{@BASE_URL}#{url}"

    # adds extension if needed
    if (url.indexOf '.js') < 0
      url += '.js'

    return [id, url, is_non_amd]

  # ...
  # define last chunk
  @define_chunk = (id, url, is_non_amd)->

    if @last_chunk is null and is_non_amd
      Chunk.chunks[id] = new Chunk 'require', id, [], null, true

    else if @last_chunk?

      # inject id into the chunk
      @last_chunk.id = (@last_chunk.id or id)

      if @last_chunk.id[0] is ':'
        @last_chunk.id = @last_chunk.id.substr 1

      # define it int the Chunk.chunks property
      Chunk.chunks[@last_chunk.id] = @last_chunk

      # resets the last reference
      @last_chunk = null

  # ...
  # Sort all params in all possible ways
  @_name_params:( type, params )->

    # initialize empty hash for holding params
    sorted = id: null, deps: null, factory: null

    switch type

      when 'require'

        # require(deps)
        # require(deps, factory)
        sorted.deps = params[0]
        sorted.factory = params[1] or null

      when'define'

        # when defining, factory will be always the last
        sorted.factory = params[params.length-1]

        # define(id, deps, factory)
        if params.length is 3
          sorted.id = params[0]
          sorted.deps = [].concat params[1]

        # define(deps, factory)
        else if params.length is 2
          sorted.deps = [].concat params[0]

        # define(factory)
        else if params.length = 1
          sorted.deps = []

    sorted