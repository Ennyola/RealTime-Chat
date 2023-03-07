const friends = document.querySelectorAll('.friends .single-friend')

friends.forEach((friend) => {
    friend.addEventListener('click', (e) => {
        window.location.href = `${window.location.origin}/chat/${friend.id}/`
    })
})