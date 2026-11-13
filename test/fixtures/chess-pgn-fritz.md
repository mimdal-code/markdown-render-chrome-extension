# Fritz / ChessBase Export

```chess
[Event "Training"]
[White "Fritz"]
[Black "User"]

1. e4 e5 #[The key opening position] 2. Nf3 Nc6 #[After the knight develops]
3. Bb5 {The Spanish.} a6 4. Ba4 Nf6 *
```
````

Expected: `#[The key opening position]` renders as `**The key opening position**` in the comment text (since the caption ends up in the annotation for move 1). Same for `#[After the knight develops]`.
