import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  InputBase,
  Button,
} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import UserImage from "components/UserImage";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/posts/${postId}/like`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to update like");
        return;
      }
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    } catch (err) {
      console.error("Like fetch error:", err);
      alert("An error occurred, please try again later");
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/posts/${postId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId, comment: commentText }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to post comment");
        return;
      }
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setCommentText("");
    } catch (err) {
      console.error("Comment fetch error:", err);
      alert("An error occurred, please try again later");
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    try {
      const response = await fetch(`http://localhost:3001/posts/${postId}/comment/${commentIndex}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Failed to delete comment");
        return;
      }
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
    } catch (err) {
      console.error("Delete comment fetch error:", err);
      alert("An error occurred while deleting the comment");
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`${process.env.REACT_APP_BASE_URL}/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <FlexBetween gap="1rem" mb="0.5rem">
            <InputBase
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                width: "100%",
                backgroundColor: palette.neutral.light,
                borderRadius: "2rem",
                padding: "0.5rem 1rem",
              }}
            />
            <Button
              disabled={!commentText.trim()}
              onClick={handleComment}
              sx={{
                color: "#000000", // Full black text
                backgroundColor: palette.primary.main, // Sky blue (#33DDFB) from theme
                borderRadius: "3rem",
                padding: "0.5rem 1rem",
                "&:hover": {
                  backgroundColor: "#000000", // Full black on hover
                  color: palette.primary.main, // Sky blue (#33DDFB) text on hover
                },
              }}
            >
              Comment
            </Button>
          </FlexBetween>
          {comments.map((comment, i) => (
            <Box key={`${comment.userId}-${i}`} display="flex" gap="1rem" alignItems="center" p="0.5rem">
              <UserImage image={comment.userPicturePath} size="30px" />
              <Box flexGrow={1}>
                <Typography sx={{ color: main, fontWeight: "500" }}>
                  {comment.firstName} {comment.lastName}
                </Typography>
                <Typography sx={{ color: main, m: "0.2rem 0" }}>
                  {comment.comment}
                </Typography>
                <Typography sx={{ color: palette.neutral.medium, fontSize: "0.75rem" }}>
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
              </Box>
              {comment.userId === loggedInUserId && (
                <IconButton onClick={() => handleDeleteComment(i)}>
                  <DeleteOutlined sx={{ color: palette.neutral.medium }} />
                </IconButton>
              )}
              <Divider />
            </Box>
          ))}
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;