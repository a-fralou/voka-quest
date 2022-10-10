import '@popperjs/core';
import Modal from 'bootstrap/js/dist/modal';
import IMask from 'imask';

const confirmModal = new Modal(document.getElementById('confirm-modal'), {});
const successModalOperator = new Modal(document.getElementById('success-modal-operator'), {});
const successModal = new Modal(document.getElementById('success-modal'), {});
const agreementModal = new Modal(document.getElementById('agreement-modal'), {});

const FINISH_LOCAL_STORAGE = 'finish';
const PHONE_VALUE_FROM_MASK = 'phone';
const CODE_VALUE_FROM_MASK = 'code';

const removeLocalData = () => {
    [FINISH_LOCAL_STORAGE, PHONE_VALUE_FROM_MASK, CODE_VALUE_FROM_MASK].forEach(function (item) {
        localStorage.removeItem(item);
    });
}

const setError = (className, text = 'Error') => {
    const error = document.querySelector(className);
    error.classList.add("form-error--show")
    error.innerHTML = text;
}

const removeError = (className) => {
    const error = document.querySelector(className);
    error.classList.remove("form-error--show")
    error.innerHTML = '';
}

window.addEventListener("load", function () {
    removeLocalData();
});

//Add masks
const optionsPhone = {
    mask: '+{375} (00) 000-00-00',
    lazy: false,
};

const optionsCode = {
    mask: '0000',
    lazy: false,
};

const maskPhone = document.getElementsByClassName("js-mask-phone");
Array.from(maskPhone).forEach(function (element) {
    const maskPhoneValue = IMask(element, optionsPhone);
    maskPhoneValue.on("accept", function () {
        //   removeError('.form-error-phone')

        localStorage.removeItem(PHONE_VALUE_FROM_MASK);
    });

    maskPhoneValue.on("complete", function () {
        removeError('.form-error-phone')

        localStorage.setItem(PHONE_VALUE_FROM_MASK, maskPhoneValue.unmaskedValue);
    });
});

const maskCode = document.getElementsByClassName("js-mask-code");
Array.from(maskCode).forEach(function (element) {
    const maskCodeValue = IMask(element, optionsCode);
    maskCodeValue.on("accept", function () {
        //   removeError(element)

        localStorage.removeItem(CODE_VALUE_FROM_MASK);
    });

    maskCodeValue.on("complete", function () {
        removeError('.form-error-code')

        localStorage.setItem(CODE_VALUE_FROM_MASK, maskCodeValue.unmaskedValue);
    });
});

const choiseData = document.querySelectorAll('.js-choise')


const eventsSubmitButton = document.querySelector(".js-fetch-form");
eventsSubmitButton.addEventListener('click', submitPhone);

const getFieldName = document.querySelector(".js-name-fetch")
getFieldName.addEventListener('input', function () {
    if (this.value) {
        removeError('.form-error-name')
    }
});

async function submitPhone() {
    const form = this.closest('form');
    const url = form.getAttribute('data-form-api');
    const getPhoneValue = localStorage.getItem(PHONE_VALUE_FROM_MASK)
    const prepareFormData = {}

    const formData = new FormData(form);

    for (const [key, value] of formData) {
        if (key !== 'phone' && key !== 'name') {
            prepareFormData[key] = value
        }
    }

    choiseData.forEach(element => {
        element.querySelectorAll('input[type=checkbox]').forEach((el) => {
            el.addEventListener('change', function () {
                console.log(this.value)
                const error = element.querySelector('.form-error');
                error.classList.remove("form-error--show")
                error.innerHTML = '';
                if (!element.querySelector('input[type=checkbox]:checked')) {

                    const error = element.querySelector('.form-error');
                    console.log(error)
                    error.classList.add("form-error--show")
                    error.innerHTML = 'Выберите 1 из вариантов!';
                    return;
                }
            });
        })


        if (!element.querySelector('input[type=checkbox]:checked')) {
            const error = element.querySelector('.form-error');
            console.log(error)

            error.classList.add("form-error--show")
            error.innerHTML = 'Выберите 1 из вариантов!';
            return;
        }
    });

    if (!getFieldName.value) {
        setError('.form-error-name', 'Заполните имя!')
        return;
    }

    if (!getPhoneValue) {
        setError('.form-error-phone', 'Заполните номер телефона!')
        return;
    }

    const data = {
        name: getFieldName.value,
        phone: getPhoneValue,
        answers: prepareFormData,
    };

    console.log(data)

    try {
        removeError('.form-error-phone')
        removeError('.form-error-code')
        this.classList.add("btn--load")
        this.setAttribute('disabled', 'disabled');

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { status, info } = await response.json();

        setTimeout(() => {
            if (status) {
                document.querySelector(".js-btn-code").removeAttribute('disabled');
                this.classList.remove("btn--load");
                this.removeAttribute('disabled');
            } else {
                setError('.form-error-phone', info)
                this.classList.remove("btn--load");
                this.removeAttribute('disabled');
            }
        }, 500);

    } catch (err) {
        setTimeout(() => {
            this.classList.remove("btn--load");
            this.removeAttribute('disabled');
            setError('.form-error-phone', 'Ошибка!')

            console.error('Ошибка:', err);
        }, 500);
    }
}

const jsInputAgree = document.querySelector(".js-input-agree")

const jsBtnCode = document.querySelector(".js-btn-code");
jsBtnCode.addEventListener('click', submitCode);

function agreeFunc() {
    if (!jsInputAgree.checked) {
        document.querySelector(".js-btn-finish").setAttribute('disabled', 'disabled');
    }
    if (jsInputAgree.checked && localStorage.getItem(FINISH_LOCAL_STORAGE)) {
        document.querySelector(".js-btn-finish").removeAttribute('disabled');
    }
}

async function submitCode() {
    const form = this.closest('form');
    const url = form.getAttribute('data-form-api');
    const getPhoneValue = localStorage.getItem(PHONE_VALUE_FROM_MASK)
    const getCodeValue = localStorage.getItem(CODE_VALUE_FROM_MASK)


    if (!getFieldName.value) {
        setError('.form-error-name', 'Заполните имя!')
        return;
    }

    if (!getPhoneValue) {
        setError('.form-error-phone', 'Заполните номер телефона!')
        return;
    }

    if (!getCodeValue) {
        setError('.form-error-code', 'Заполните поле с кодом!')
        return;
    }

    const data = {
        name: getFieldName.value,
        phone: getPhoneValue,
        code: getCodeValue,
    };

    console.log(data)

    try {
        removeError('.form-error-phone')
        removeError('.form-error-code')
        this.classList.add("btn--load")
        this.setAttribute('disabled', 'disabled');

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { status, info } = await response.json();

        setTimeout(() => {
            if (status) {
                localStorage.setItem(FINISH_LOCAL_STORAGE, true);
                agreeFunc()
                this.classList.remove("btn--load");
                this.removeAttribute('disabled');
            } else {
                setError('.form-error-code', info)
                this.classList.remove("btn--load");
                this.removeAttribute('disabled');
            }
        }, 500);

    } catch (err) {
        setTimeout(() => {
            this.classList.remove("btn--load");
            this.removeAttribute('disabled');
            setError('.form-error-code', 'Ошибка!')

            console.error('Ошибка:', err);
        }, 500);
    }
}

jsInputAgree.addEventListener('change', function () {
    agreeFunc()
});



const jsBtnFinish = document.querySelector(".js-btn-finish");
jsBtnFinish.addEventListener('click', function () {
    const getGrade = document.querySelector('input[name="recomendation"]:checked');
    if (getGrade) {
        if (getGrade.value < 8) {
            ctaModal()
        } else {
            submitFinish(false)
        }
    } else {
        submitFinish(false)
    }
});

function ctaModal() {
    const getPhoneValue = localStorage.getItem(PHONE_VALUE_FROM_MASK)
    const getCodeValue = localStorage.getItem(CODE_VALUE_FROM_MASK)

    if (!getFieldName.value) {
        setError('.form-error-name', 'Заполните имя!')
        return;
    }

    if (!getPhoneValue) {
        setError('.form-error-phone', 'Заполните номер телефона!')
        return;
    }

    if (!getCodeValue) {
        setError('.form-error-code', 'Заполните поле с кодом!')
        return;
    }

    confirmModal.show()
}

const jsBtnYaes = document.querySelector(".js-btn-yes");
jsBtnYaes.addEventListener('click', function () {
    submitFinish(true)
});

const jsBtnNo = document.querySelector(".js-btn-no");
jsBtnNo.addEventListener('click', function () {
    submitFinish(false)
});


async function submitFinish(cta) {
    const form = document.querySelector('.js-form-end');
    const url = form.getAttribute('data-form-api');
    const getPhoneValue = localStorage.getItem(PHONE_VALUE_FROM_MASK)
    const getCodeValue = localStorage.getItem(CODE_VALUE_FROM_MASK)
    if (!getFieldName.value) {
        setError('.form-error-name', 'Заполните имя!')
        return;
    }

    if (!getPhoneValue) {
        setError('.form-error-phone', 'Заполните номер телефона!')
        return;
    }

    if (!getCodeValue) {
        setError('.form-error-code', 'Заполните поле с кодом!')
        return;
    }

    const data = {
        name: getFieldName.value,
        phone: getPhoneValue,
        code: getCodeValue,
        cta: cta
    };

    console.log(data)

    try {
        removeError('.form-error-phone')
        removeError('.form-error-code')
        document.querySelector('.js-btn-yes').classList.add("btn--load")
        document.querySelector('.js-btn-no').classList.add("btn--load")
        document.querySelector('.js-btn-yes').setAttribute('disabled', 'disabled')
        document.querySelector('.js-btn-no').setAttribute('disabled', 'disabled')

        document.querySelector('.js-btn-finish').classList.add("btn--load")
        document.querySelector('.js-btn-finish').setAttribute('disabled', 'disabled')

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { status, info } = await response.json();

        setTimeout(() => {
            confirmModal.hide()
            if (status) {
                document.querySelector('.js-btn-yes').classList.remove("btn--load")
                document.querySelector('.js-btn-no').classList.remove("btn--load")
                document.querySelector('.js-btn-yes').removeAttribute('disabled')
                document.querySelector('.js-btn-no').removeAttribute('disabled')

                document.querySelector('.js-btn-finish').classList.remove("btn--load")
                document.querySelector('.js-btn-finish').removeAttribute('disabled', 'disabled')

                if (cta) {
                    successModalOperator.show()
                } else {
                    successModal.show()
                }
            } else {
                setError('.form-error-code', info)
                document.querySelector('.js-btn-yes').classList.remove("btn--load")
                document.querySelector('.js-btn-no').classList.remove("btn--load")
                document.querySelector('.js-btn-yes').removeAttribute('disabled')
                document.querySelector('.js-btn-no').removeAttribute('disabled')
                document.querySelector('.js-btn-finish').classList.remove("btn--load")
                document.querySelector('.js-btn-finish').removeAttribute('disabled', 'disabled')
            }

        }, 500);

    } catch (err) {
        setTimeout(() => {
            document.querySelector('.js-btn-yes').classList.remove("btn--load")
            document.querySelector('.js-btn-no').classList.remove("btn--load")
            document.querySelector('.js-btn-yes').removeAttribute('disabled')
            document.querySelector('.js-btn-no').removeAttribute('disabled')
            document.querySelector('.js-btn-finish').classList.remove("btn--load")
            document.querySelector('.js-btn-finish').removeAttribute('disabled', 'disabled')
            setError('.form-error-end', 'Ошибка!')
            confirmModal.hide()
            console.error('Ошибка:', err);
        }, 500);
    }
}

const btnClose = document.querySelector(".btn-close");
btnClose.addEventListener('click', function () {
    agreementModal.hide()
});

const successHidemodal = document.getElementById("success-modal");
successHidemodal.addEventListener('hidden.bs.modal', function () {
    agreementModal.show()
});

const successOperatorHidemodal = document.getElementById("success-modal-operator");
successOperatorHidemodal.addEventListener('hidden.bs.modal', function () {
    agreementModal.show()
});