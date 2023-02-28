const friends = document.querySelectorAll('.friends .friend')
const goToPage = (friends) => {
    friends.forEach((item) => {
        item.addEventListener('click', (e) => {
            window.location.href = `${window.location.origin}/chat/${item.id}/`
        })
    })
}

goToPage(friends)