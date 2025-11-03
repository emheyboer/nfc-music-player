if (action == 'up') {
    volume = Math.min(Number(volume) + 5, 100);
} else if (action == 'down') {
    volume = Math.max(Number(volume) - 5, 0);
}
