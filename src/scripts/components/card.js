export const likeCard = (likeButton, cardId, onLikeSuccess) => {
  if (onLikeSuccess) {
    onLikeSuccess(likeButton, cardId);
  } else {
    
    likeButton.classList.toggle("card__like-button_is-active");
  }
};

export const deleteCard = (cardElement, cardId, onDeleteSuccess) => {
  if (onDeleteSuccess) {
    onDeleteSuccess(cardId, cardElement);
  } else {
    cardElement.remove();
  }
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info"); 
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");
  const cardTitle = cardElement.querySelector(".card__title");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  if (likeCount) {
    likeCount.textContent = data.likes.length;
  }

  const isLiked = data.likes.some(like => like._id === currentUserId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (infoButton && onInfoClick) {
    infoButton.addEventListener("click", (evt) => {
      evt.stopPropagation();
      onInfoClick(data._id);
    });
  }

  if (data.owner._id !== currentUserId) {
    if (deleteButton) deleteButton.remove();
  } else {
    if (deleteButton && onDeleteCard) {
      deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
    }
  }

  if (likeButton && onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
      onLikeIcon(likeButton, data._id, isCurrentlyLiked, likeCount);
    });
  }

  if (cardImage && onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};