// ALL core deliverables are complete upon first rendering of the page, there's an issue with the adding/deleting reviews part
//once switched to a different beer

// global variables
const navMenu = document.querySelector('header').querySelector('ul')
const beerDetails = document.querySelector('.beer-details')
const beerDescForm = beerDetails.querySelector('.description')
const reviewForm = beerDetails.querySelector('.review-form')
const reviewsList = beerDetails.querySelector('.reviews')
const url = `http://localhost:3000/beers/`

// fetch requests
const fetchMenu = () => {
    fetch(url)
    .then(response => response.json())
    .then(renderMenu)
}

const fetchBeerDetails = id => {
    fetch(`${url}${id}`)
    .then(response => response.json())
    .then(renderBeerDetails)
}

const fetchUpdateBeerDesc = e => {
    const id = e.target.dataset.id
    const updatedDesc = {description: e.target[0].value}

    fetch(`${url}${id}`,{
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedDesc)
    })
    .then(response => response.json())
    .then(updatedBeerObj => {
        const descArea = beerDescForm.querySelector('textarea')
        descArea.innerText = updatedBeerObj.description
        //pessimistic rendering - only updates if the PATCH was successful
    })
}

const fetchAddReview = (beerObj, e) => {
    const id = e.target.dataset.id
    const newReview = e.target[0].value
    beerObj.reviews.push(newReview)

    fetch(`${url}${id}`,{
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({reviews: beerObj.reviews})
    })
    .then(response => response.json())
    .then(() => {
        const newLi = document.createElement('li')
            newLi.innerText = newReview
            const deleteButton = document.createElement('button')
            deleteButton.className = "delete-btn"
            deleteButton.innerText = "X"
            deleteButton.dataset.id = beerObj.id
            newLi.append(deleteButton)
        reviewsList.append(newLi)
        //pessimistic rendering - only updates if the PATCH was successful
    })
}

const fetchDeleteReview = (reviewLiToDelete, beerObj, e) => {
    const id = e.target.dataset.id
    reviewLiToDelete.querySelector('button').remove()
    //removing button to find the review that will match the innerText of the review
    const deletedReview = reviewLiToDelete.innerText

    beerObj.reviews = beerObj.reviews.filter(review => {
        return review !== deletedReview
    })
    // filtering the beerObj.reviews array to get rid of the review to delete

    fetch(`${url}${id}`,{
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({reviews: beerObj.reviews})
    })
    .then(response => response.json())
    .then(() => {
        reviewLiToDelete.remove()
        //pessimistic rendering - only updates if the PATCH was successful
    })
}

// DOM Manipulations
const renderBeerDetails = beerObj => {
    const beerH2 = beerDetails.querySelector('h2')
        beerH2.innerText = beerObj.name
    const beerImg = beerDetails.querySelector('img')
        beerImg.src = beerObj.image_url
        beerImg.alt = beerObj.image_url

    beerDescForm.dataset.id = beerObj.id
        const descArea = beerDescForm.querySelector('textarea')
        descArea.innerText = beerObj.description

    reviewForm.dataset.id = beerObj.id

    reviewsList.innerHTML = ""
    beerObj.reviews.forEach(review => {
        const newLi = document.createElement('li')
            newLi.innerText = review
            const deleteButton = document.createElement('button')
            deleteButton.className = "delete-btn"
            deleteButton.innerText = "X"
            deleteButton.dataset.id = beerObj.id
            newLi.append(deleteButton)
        reviewsList.append(newLi)
    })

    //using closure for the review form because I'll have access to beerObj.reviews
    reviewForm.addEventListener('submit', e => {
        e.preventDefault()
        fetchAddReview(beerObj, e)
        e.target.reset()
    })

    reviewsList.addEventListener('click', e => {
        if (e.target.matches('.delete-btn')) {
            const reviewLiToDelete = e.target.closest('li') 
            fetchDeleteReview(reviewLiToDelete, beerObj, e)
        }
    })
}

const renderMenu = beersArray => {
    navMenu.innerHTML = ""
    beersArray.forEach(beerObj => {
        const newLi = document.createElement('li')
            newLi.innerText = beerObj.name
            newLi.dataset.id = beerObj.id
        navMenu.append(newLi)
    })
}

// event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchMenu()
    fetchBeerDetails(1)
        //initializes with the FIRST beer from db.json
})

beerDescForm.addEventListener('submit', e => {
    e.preventDefault()
    fetchUpdateBeerDesc(e)
    e.target.reset()
})

navMenu.addEventListener('click', e => {
    if (e.target.matches('li')){
        const id = e.target.dataset.id
        fetchBeerDetails(id)
    }
})

