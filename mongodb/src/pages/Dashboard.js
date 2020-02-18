import React from "react"

import { Container, Row, Col, Card } from "react-bootstrap"

import { Redirect, useHistory } from "react-router-dom"
import { connect } from "react-redux"

const Dashboard = ({ dispatch, notes, isLoggedIn }) => {
  let history = useHistory()

  const renderPost = (note, index) => {
    history.push(`/post/${note._id}/${index}`)
  }

  if (!isLoggedIn) {
    return <Redirect to="/" />
  }

  return (
    <div>
      <div>
        <br />
        <Container>
          { notes.slice(0).reverse().map((note, ind) => (
            <div key={ ind }>
              <Row>
                <Col>
                  <Card
                    className="pointer"
                    onClick={ () => renderPost(note, ind) }
                  >
                    <Card.Body className="text-left">
                      <Card.Title>
                        <h5>{ note.title }</h5>
                      </Card.Title>

                      <Card.Text>
                        submitted at { note._createdAt } by
                        { ` ${note.author.username}` }
                      </Card.Text>

                      <footer className="blockquote-footer">
                        { note.num_comments } comments
                      </footer>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <br />
            </div>
          ))}
        </Container>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  notes: state.notesReducer.notes,
  isLoggedIn: state.userReducer.isLoggedIn
})

export default connect(mapStateToProps)(Dashboard)
