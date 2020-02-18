import React from 'react'

import { Button, Spinner } from 'react-bootstrap'

import { connect } from 'react-redux'

const Loading = () => {
  return (
    <div style={
      {
        "minHeight": "70vh",
        "display": "flex",
        "justifyContent": "center",
        "alignItems": "center"
      }
    }>
      <Button variant="primary" disabled>
        <Spinner
          as="span" animation="grow"
          size="sm" role="status" aria-hidden="true"
        />
        Loading...
      </Button>
    </div>
  )
}

const mapStateToProps = state => ({})

export default connect(mapStateToProps)(Loading)
