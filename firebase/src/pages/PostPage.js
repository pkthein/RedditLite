import React from 'react';

import { connect } from 'react-redux'
import { useHistory, useParams } from 'react-router-dom'

import {
  Container, Button, Modal, InputGroup, FormControl, Row, Col
} from 'react-bootstrap'

import {
  addFirstComment, addSecondComment, loadPostContent
} from '../redux/actions/notesActions'

const PostPage = ({ dispatch, isLoggedIn, post, username, notes }) => {
  const [firstReply, setFirstReply] = React.useState('')
  const [secondReply, setSecondReply] = React.useState('')
  const [showPost, setShowPost] = React.useState(false)
  const [show, setShow] = React.useState(false)

  const [parentIndex, setParentIndex] = React.useState(-1)

  let history = useHistory()
  let { id } = useParams()
  
  React.useEffect(() => {
    dispatch(loadPostContent(id))
  }, [notes.length, id])

  if (!isLoggedIn) {
    setTimeout(() => {
      if (!isLoggedIn) {
        history.push('/')
      }
    }, 3000)
  }

  const handleFirstComment = firstReply => {
    dispatch(addFirstComment(firstReply, username))
    setShowPost(false)
  }

  const invokeSecondComment = fCindex => {
    setParentIndex(fCindex)
    setShow(true)
  }

  const handleSecondComment = secondComment => {
    dispatch(addSecondComment(secondComment, parentIndex, username))
    setShow(false)
  }

  return (
    <div hidden={ !isLoggedIn }>
      <br />
      <Container>
        { post.content && (
            <div className="Post-card">
              <h3>{ post.content.title }</h3>
              <dir className="Post-signature">
                By { post.content.author }
              </dir>
              <p>
                { post.content.text }
              </p>
              <div className="Post-toolbar">
                <Container>
                  <Row>
                    <Col md={ 10 }>
                      <i className="material-icons md-14">forum</i>
                      <b className="p-right">
                        { post.content.num_comments } Comments
                      </b>
                    </Col>

                    <Col>
                      <Button
                        variant="outline-secondary" size="small"
                        onClick={ () => setShowPost(true) }
                      >
                        Comment
                      </Button>
                    </Col>
                  </Row>
                </Container>

                <Modal show={ showPost } onHide={ () => setShowPost(false) } centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Your Comment</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <InputGroup>
                      <FormControl
                        placeholder = "Your words here"
                        as = "textarea"
                        onChange={ e => setFirstReply(e.target.value) }
                      />
                    </InputGroup>
                    
                    <Modal.Footer>
                      <Button
                        variant="outline-secondary"
                        onClick={ () => handleFirstComment(firstReply) }
                      >
                        Post
                      </Button>
                    </Modal.Footer>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          )
        }

        {
          (post && post.comments) && post.comments.map((firstComment, fCindex) => (
            <dir className="Comment-card" key={ fCindex }>
              { firstComment.text } <br />
              <dir className="Post-signature">
                <Container>
                  <Row>
                    <Col md={ 10 }>
                      By { firstComment.author } at { firstComment._createdAt }
                    </Col>
                    <Col>
                      <Button
                        variant="outline-secondary" size="small"
                        onClick={ () => invokeSecondComment(fCindex) }
                      >
                        Reply
                      </Button>
                    </Col>
                  </Row>
                </Container>

                <Modal show={ show } onHide={ () => setShow(false) } centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Your Comment</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <InputGroup>
                      <FormControl
                        placeholder = "Your words here"
                        as = "textarea"
                        style={{ "minHeight": "30vh" }}
                        onChange={ e => setSecondReply(e.target.value) }
                      />
                    </InputGroup>
                    <Modal.Footer>
                      <Button
                        style={{ "align": "right" }}
                        variant="outline-secondary" type="sm"
                        onClick={
                          () => handleSecondComment(secondReply)
                        }
                      >
                        Submit
                      </Button>
                    </Modal.Footer>
                  </Modal.Body>                    
                </Modal>
              </dir>
              
              {
                firstComment.comments && firstComment.comments.map((secondComment, sCindex) => (
                  <dir className="Comment-card" key={ sCindex }>
                    { secondComment.text } <br />
                    <dir className="Post-signature">
                      By { secondComment.author } at { secondComment._createdAt }
                    </dir>

                  </dir>
                ))
              }
            </dir>
          ))
        }
      </Container>
    </div>
  )
}

const mapStatetoProps = state => ({
  isLoggedIn: state.userReducer.isLoggedIn,
  post: state.notesReducer.post,
  username: state.userReducer.username,
  notes: state.notesReducer.notes
})

export default connect(mapStatetoProps)(PostPage)
