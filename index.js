
const Store = require('data-store')
const uniqid = require('uniqid')

const store = new Store('z-todo')

/***********
 * PRIVATE *
 ***********/

/**
 * Checks if a TODO is valid
 * @param {Object} data - the TODO to check
 * @param {*} forgiveId - allow the id not to be checked
 * @returns {Promise} - resolves with the complete todo or rejects with a reason
 */
function _checkTodo (data, forgiveId = false) {
  const { todo, complete, id } = data
  if (!forgiveId && (!id || !_checkExists(id))) return Promise.reject(new Error('Invalid "id" field'))
  if (!todo || typeof todo !== 'string') return Promise.reject(new Error('Invalid "todo" field'))
  if (typeof complete !== 'boolean') return Promise.reject(new Error('Invalid "complete" field'))
  return Promise.resolve({ todo, complete, id })
}

/**
 * Checks by id if a TODO exists
 * @param {String} id - the TODO id to check
 */
function _checkExists (id) {
  const todos = getAll()
  return !!todos.find(todo => todo.id === id)
}

/**********
 * PUBLIC *
 **********/

/**
 * Adds a TODO to the todolist
 * @param {Object} newTodo - the TODO object to add
 */
function add (newTodo) {
  return _checkTodo(newTodo, true)
    .then(({ todo, complete }) => store.union('todos', ({ todo, complete, id: uniqid() })))
}

/**
 * @returns - the current list of TODOs
 */
function getAll () {
  return store.get('todos') || []
}

/**
 * Updates an existing TODO values (todo, complete)
 * @param {Object} todoToUpdate - An existing TODO with new values
 */
function update ({ todo, complete, id }) {
  return override(getAll().map(currentTodo => {
    if (currentTodo.id === id) return { todo, complete, id }
    return currentTodo
  }))
}

/**
 * Overrides the list of TODOs
 * @param {*} newTodos - the new TODO list
 */
function override (newTodos) {
  return Promise.all(newTodos.map(todo => _checkTodo(todo)))
    .then(todos => store.set('todos', todos))
}

module.exports = {
  add,
  getAll,
  update,
  override
}
