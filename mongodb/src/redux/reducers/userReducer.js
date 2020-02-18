const INITIAL_STATE = {
  activeUsers: 0,
  email: '',
  username: '',
  isLoggedIn: false
}

// Step 2 create listener function
const userReducer = (state = INITIAL_STATE, action) => {
  // Step 3 create switch for action types
  switch (action.type) {
    case 'SET_ACTIVE_USERS':
      return {
        ...state,
        activeUsers: action.activeUsers
      }
    case 'SET_IS_LOGGED_IN':
      if (!action.isLoggedIn) {
        document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'email=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
        document.cookie = 'password=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
      };
    case 'SET_EMAIL':
      return {
        ...state,
        email: action.email,
      };
    case 'SET_USERNAME':
      return {
        ...state,
        username: action.username,
      };
    default:
      return state;
  }
};

// don't forget to export
export default userReducer;
