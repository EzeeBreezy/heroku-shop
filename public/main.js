//* global variables and shortcuts
let products = [], users = []
let currentUser = {}
let userLogin = "", userPwd = ""
let signedInState = false

const create = (tag, className) => {
  let newTag = document.createElement(tag)
  newTag.className += className
  return newTag
}

const addComment = (parentTag, commentBody) => {
  const title = create("h3", null)
  title.innerText = commentBody.username
  parentTag.appendChild(title)
  parentTag.appendChild(document.createElement("hr"))
  const message = create("p", null)
  message.innerText = commentBody.comment
  parentTag.appendChild(message)
}

//* IIFE to check if there are products and users
//* in localhost and pick`em up
;(function initiation() {
  fetch("/products")
    .then(response => {
      return response.json()
    })
    .then(data => {
      products = data
      //once we have products list - calling IIFE to place them on page
      ;(function placeProducts() {
        for (let i = 0; i < products.length; i++) {
          const box = new ProductBox(products[i])
          container.appendChild(box)
        }
      })()
    })

  fetch("/users")
  .then(response => {
    return response.json()
  })
  .then(data => {
    users = data
  })
})()

//* creating special product holder node for our sweet css
class ProductBox {
  constructor(product) {
    const box = create("div", "box")
    //! do i really need this?
    // box.setAttribute("productNumber", `${productNumber}`)
    box.setAttribute("productNumber", product.id)
    //small trick =)
    const imgBox = create("div", "imgBox")
    const img = create("img", "productPicture")
    img.src = product.picture
    img.alt = "random picture"
    imgBox.appendChild(img)
    box.appendChild(imgBox)
    let layer = create("div", "layer layer1")
    box.appendChild(layer)
    layer = create("div", "layer layer2")
    box.appendChild(layer)
    const contentBx = create("div", "contentBx")
    const descriptions = create("div", "descriptions")
    const prodTitle = create("h2", "prodTitle")
    prodTitle.innerText = product.title
    const descrText = create("p", "descrText")
    descrText.innerText = product.description
    const ratings = create("div", "ratings")
    const likes = create("span", "likes")
    const heart = create("i", "far fa-heart")
    likes.appendChild(heart)
    const likesNum = create("span", "likesNumber")
    likesNum.innerText = ` ${product.likes} likes`
    likes.appendChild(likesNum)
    likes.onclick = event => {
      if (signedInState) {
        event.currentTarget.firstChild.classList.toggle("fas")
        event.currentTarget.firstChild.classList.toggle("far")
        if (product.wholiked.includes(userLogin)) {
          product.likes--
          product.wholiked.pop(userLogin)
        } else {
          product.likes++
          product.wholiked.push(userLogin)
        }
        event.currentTarget.lastChild.innerText = ` ${product.likes} likes`
        
        fetch(`/products/${product.id}`, {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({"likes": product.likes, "wholiked": product.wholiked})
        })
      } else
        alert(
          "You cant like or leave comments if you not signed in. Think about that..."
        )
    }
    const open = create("span", "openComments")
    open.innerText = "See Comments"

    ratings.appendChild(likes)
    ratings.appendChild(open)
    descriptions.appendChild(prodTitle)
    descriptions.appendChild(descrText)
    descriptions.appendChild(ratings)
    contentBx.appendChild(descriptions)
    box.appendChild(contentBx)

    const commentBx = create("div", "commentBx")
    const commentsField = create("div", "commentsField")
    for (let messages of product.comments) {
      addComment(commentsField, messages)
    }
    commentBx.appendChild(commentsField)
    const leaveComment = create("div", "leaveComment")
    const message = create("input", null)
    leaveComment.appendChild(message)
    const postComment = create("button", "button")
    postComment.id = "postComment"
    postComment.innerText = "Post"
    postComment.onclick = () => {
      if (signedInState) {
        if (message.value) {
          let commentBody = {}
          commentBody.username = userLogin
          commentBody.comment = message.value
          message.value = ''
          addComment(commentsField, commentBody)
          product.comments.push(commentBody)
          fetch(`/products/${product.id}`, {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
          })
        } else alert("Please type something first")
      } else
        alert(
          "You cant like or leave comments if you not signed in. Think about that..."
        )
    }
    leaveComment.appendChild(postComment)
    const closeComment = create("span", "ratings")
    closeComment.innerText = "Close comments"
    closeComment.onclick = () => {
      commentBx.style.zIndex = "-20"
    }
    open.onclick = () => {
      commentBx.style.zIndex = "20"
    }
    leaveComment.appendChild(closeComment)
    commentBx.appendChild(leaveComment)

    box.appendChild(commentBx)
  
    return box
  }
}

//* adding products on the page
;(function placeProducts() {
  for (let i = 0; i < products.length; i++) {
    const box = new ProductBox(i, products[i])
    container.appendChild(box)
  }
})()

function readUserName() {
  if (login.value && password.value) {
    userLogin = login.value
    login.value = ""
    userPwd = password.value
    password.value = ""
    return true
  } else {
    alert("Please enter username and password")
    return false
  }
}

function signInFunc(bool) {
  if (bool) {
    signedInState = true
    authorization.style.display = "none"
    welcomeText.innerText = `Welcome ${userLogin}!`
    userWelcome.style.display = "block"
    let checkLikes = [...document.getElementsByClassName("box")]
    for (let elem of checkLikes) {
      let prodNumber = elem.getAttribute("productNumber")
      if (products[prodNumber].wholiked.includes(userLogin)) {
        let icon = elem.getElementsByTagName("i")
        icon[0].classList.toggle("fas")
        icon[0].classList.toggle("far")
      }
    }
  } else {
    signedInState = false
    authorization.style.display = "block"
    userWelcome.style.display = "none"
  }
}

createAccountBtn.onclick = () => {
  let check = true
  if (readUserName()) {
    for (let user of users)
      if (user.username == userLogin) {
        alert("This name already busy, try another")
        check = false
        break
      }
    if (check) {
      currentUser.username = userLogin
      currentUser.password = userPwd
      users.push(currentUser)
      fetch('/users', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentUser)
      })
      signInFunc(true)
      console.log("user created")
    }
  }
}

signinBtn.onclick = () => {
  let check = false
  if (readUserName()) {
    for (let user of users)
      user.username == userLogin && user.password == userPwd
        ? (check = true)
        : null
    check
      ? signInFunc(true)
      : alert("There is no such username or password is incorrect")
  }
}

signoffBtn.onclick = () => {
  signInFunc(false)
}
