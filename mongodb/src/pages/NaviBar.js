import React from "react"

import {
  Navbar, NavbarBrand, Nav, UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem, Button
} from "reactstrap"

import { useHistory } from 'react-router-dom'

import { connect } from 'react-redux'
import { logoutUser } from '../redux/actions/userActions'

const NaviBar = ({ dispatch, username, isLoggedIn, activeUsers, email }) => {
  let history = useHistory()

  const accountLogOut = () => {
    window.ws.send(JSON.stringify({
      type: 'LOGGED_OUT',
      email
    }))
    dispatch(logoutUser())
    history.push('/')
  }

  const goHome = () => {
    history.push('/')
  }

  const goCreate = () => {
    history.push('/post/create')
  }

  return (
    <div>
      <Navbar className='nav' fixed="top">
        <div className="pointer">
          <NavbarBrand id="brand" onClick={ () => goHome() }>
            Reddit-Lite (Online { activeUsers })
          </NavbarBrand>
        </div>

        {
          isLoggedIn && (
            <Nav className="nav">
              <Button color="primary" onClick={ () => goCreate() }>
                <i className="fa fa-pencil"></i> Write Post
              </Button>

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  { username } <i className="fa fa-user"></i>
                </DropdownToggle>

                <DropdownMenu right>
                  <DropdownItem onClick={ () => accountLogOut() }>
                    <i className="fa fa-sign-out"></i>Logout
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          )
        }
      </Navbar>
    </div>
  )
}

const mapStateToProps = state => ({
  username: state.userReducer.username,
  isLoggedIn: state.userReducer.isLoggedIn,
  activeUsers: state.userReducer.activeUsers,
  email: state.userReducer.email
})

export default connect(mapStateToProps)(NaviBar);
