import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation } from "./components/validation.js";
import { getUserInfo, getCardList, setUserInfo, updateAvatar, addNewCard, deleteCardFromServer, changeLikeCardStatus } from "./components/api.js";


const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings); 

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");
const removeCardCloseButton = removeCardModalWindow.querySelector(".popup__close");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoModalWindow.querySelector(".popup__title");
const cardInfoDefinitionList = cardInfoModalWindow.querySelector(".popup__info"); 
const cardInfoText = cardInfoModalWindow.querySelector(".popup__text"); 
const cardInfoUsersList = cardInfoModalWindow.querySelector(".popup__list"); 

const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template");
const infoUserPreviewTemplate = document.querySelector("#popup-info-user-preview-template");

let currentCardToDelete = null;
let currentCardIdToDelete = null;
let currentUserId = null;

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

const handleAvatarFormSubmit = (evt) => {  
  evt.preventDefault();
  const avatarUrl = avatarInput.value; 
  const submitButton = evt.submitter;
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  updateAvatar(avatarUrl)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

const handleLikeIcon = (likeButton, cardId, isCurrentlyLiked, likeCount) => {
  changeLikeCardStatus(cardId, isCurrentlyLiked)
    .then((updatedCard) => {
      likeButton.classList.toggle('card__like-button_is-active');

      if (likeCount) {
        likeCount.textContent = updatedCard.likes.length;
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  const cardName = cardNameInput.value;
  const cardLink = cardLinkInput.value;

  const submitButton = evt.submitter;
  const originalButtonText = submitButton.textContent;

  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;
  addNewCard({ name: cardName, link: cardLink })
    .then((newCard) => {
      const cardElement = createCardElement(newCard, currentUserId, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeIcon,
        onDeleteCard: handleOpenDeleteModal,
        onInfoClick: handleInfoClick
      });

      placesWrap.prepend(cardElement);

      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

const handleOpenDeleteModal = (cardElement, cardId) => {
  currentCardToDelete = cardElement;
  currentCardIdToDelete = cardId;

  openModalWindow(removeCardModalWindow);
};

const handleDeleteConfirm = (evt) => {
  evt.preventDefault();

  const submitButton = removeCardForm.querySelector(".popup__button");
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = 'Удаление...';
  submitButton.disabled = true;

  deleteCardFromServer(currentCardIdToDelete)
    .then(() => {
      if (currentCardToDelete && currentCardToDelete.remove) {
        currentCardToDelete.remove();
      }
      closeModalWindow(removeCardModalWindow);
      currentCardToDelete = null;
      currentCardIdToDelete = null;
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
};

const handleCloseDeleteModal = () => {
  currentCardToDelete = null;
  currentCardIdToDelete = null;
  removeCardForm.reset();
};

removeCardCloseButton.addEventListener("click", () => {
  closeModalWindow(removeCardModalWindow);
  handleCloseDeleteModal();
});

removeCardModalWindow.addEventListener("click", (evt) => {
  if (evt.target === removeCardModalWindow) {
    closeModalWindow(removeCardModalWindow);
    handleCloseDeleteModal();
  }
});

const getCardDate = (card) => {
  if (!card.createdAt) return null;
  const date = new Date(card.createdAt);
  return isNaN(date.getTime()) ? null : date;
};

const createInfoString = (term, description) => {
  if (!infoDefinitionTemplate) return document.createElement('div');
  
  const template = infoDefinitionTemplate.content.cloneNode(true);
  template.querySelector(".popup__info-term").textContent = term;
  template.querySelector(".popup__info-description").textContent = description;
  
  return template;
};

const createUserPreview = (user) => {
  if (!infoUserPreviewTemplate) return document.createElement('li');
  const template = infoUserPreviewTemplate.content.cloneNode(true);
  const listItem = template.querySelector(".popup__list-item");
  if (listItem) {
    listItem.innerHTML = `<span class="popup__list-item-name">${user.name}</span>`;
  }
  return template;
};

const handleInfoClick = (cardId) => {
  [cardInfoDefinitionList, cardInfoUsersList].forEach(el => el && (el.innerHTML = ''));
  if (cardInfoText) cardInfoText.textContent = '';
  if (cardInfoTitle) cardInfoTitle.textContent = 'Информация о карточке';
  openModalWindow(cardInfoModalWindow);
  getCardList()
    .then((cards) => {
      const card = cards.find(c => c._id === cardId);
      if (!card) throw new Error('Карточка не найдена');
      [cardInfoDefinitionList, cardInfoUsersList].forEach(el => el && (el.innerHTML = ''));
      const likesCount = card.likes?.length || 0;
      const formattedDate = formatDate(getCardDate(card));
      const infoItems = [
        ["Описание:", card.name],
        ["Дата создания:", formattedDate],
        ["Владелец:", card.owner.name],
        ["Количество лайков:", likesCount.toString()]
      ];
      infoItems.forEach(([term, desc]) => {
        cardInfoDefinitionList?.append(createInfoString(term, desc));
      });
      if (cardInfoText) {
        cardInfoText.textContent = likesCount === 0 ? 'Нет лайков' : 'Лайкнули:';
      }
      card.likes?.forEach(user => {
        cardInfoUsersList?.append(createUserPreview(user));
      });
    })
    .catch((err) => console.error(err));
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);
removeCardForm.addEventListener("submit", handleDeleteConfirm);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;
    
    const titleElement = document.querySelector('.profile__title');
    const descriptionElement = document.querySelector('.profile__description');
    const avatarElement = document.querySelector('.profile__image');
    titleElement.textContent = userData.name;
    descriptionElement.textContent = userData.about;
    avatarElement.style.backgroundImage = `url(${userData.avatar})`;

    const cardsContainer = document.querySelector('.places__list');
    cardsContainer.innerHTML = ''; 
    cards.forEach((card) => {
      const cardElement = createCardElement(card, currentUserId, {
        onPreviewPicture: handlePreviewPicture,
        onLikeIcon: handleLikeIcon,
        onDeleteCard: handleOpenDeleteModal,
        onInfoClick: handleInfoClick
      });
      cardsContainer.append(cardElement);
    });
  })
  .catch((err) => {
    console.error(err);
  });