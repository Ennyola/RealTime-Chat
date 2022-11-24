let friendList = document.querySelectorAll(".friends-list .single-friend")
    // Go to a particular room when you click on a friend's name
export const goToPage = (friends = friendList) => {
    friends.forEach((item) => {
        item.addEventListener('click', (e) => {
            window.location.href = `${window.location.origin}/chat/${item.id}/`
        })
    })
}
goToPage()