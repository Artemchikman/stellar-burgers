describe('Тесты для конструктора бургера без перетаскивания', () => {
  beforeEach(() => {
    // Перехватываем запросы к API ингредиентов и заказов
    cy.intercept('GET', '/api/ingredients', { fixture: 'ingredients.json' }).as(
      'getIngredients'
    );
    cy.intercept('POST', '/api/orders', { fixture: 'post_order.json' }).as(
      'postOrder'
    );

    // Переходим на главную страницу
    cy.visit('/');
  });

  it('Добавление ингредиента в конструктор через кнопку', () => {
    // Ожидаем загрузки ингредиентов
    cy.wait('@getIngredients');

    // Нажимаем кнопку "Добавить" для булки (например, "Флюоресцентная булка R2-D3")
    cy.get('[data-cy="ingredients-module"]')
      .contains('Флюоресцентная булка R2-D3')
      .parent()
      .find('button')
      .click();

    // Проверяем, что булка добавлена в конструктор
    cy.get('[data-cy="constructor-module"]').should(
      'contain.text',
      'Флюоресцентная булка R2-D3'
    );

    // Нажимаем кнопку "Добавить" для начинки (например, "Хрустящие минеральные кольца")
    cy.get('[data-cy="ingredients-module"]')
      .contains('Хрустящие минеральные кольца')
      .parent()
      .find('button')
      .click();

    // Проверяем, что начинка добавлена в конструктор
    cy.get('[data-cy="constructor-module"]').should(
      'contain.text',
      'Хрустящие минеральные кольца'
    );
  });

  it('Открытие и закрытие модального окна ингредиента', () => {
    // // Ожидаем загрузки ингредиентов
    // cy.wait('@getIngredients');

    // Открываем модальное окно ингредиента
    cy.contains('булка').click();
    cy.get('[data-cy="modal"]').should('be.visible'); // Проверяем, что модальное окно открылось

    // Закрываем по крестику
    cy.get('[data-cy="modal"]').click();
    cy.get('[data-cy="modal"]').should('not.exist'); // Проверяем, что модальное окно закрылось
    cy.get('body').type('{esc}'); //Закрываем клавишей Esc
    // Открываем снова и закрываем по клику на оверлей
    cy.get('[data-cy="ingredients-module"]')
      .contains('Флюоресцентная булка R2-D3')
      .click();
    cy.get('[data-cy="modal"]').should('exist');
    cy.get('[data-cy="modalOverlay"]').click({ force: true });
    cy.get('[data-cy="modal"]').should('not.exist');
  });

  it('Оформление заказа', () => {
    // Ожидаем загрузки ингредиентов
    cy.wait('@getIngredients');

    // Добавляем булку и начинку
    cy.get('[data-cy="ingredients-module"]')
      .contains('Флюоресцентная булка R2-D3')
      .parent()
      .find('button')
      .click({ force: true });
    cy.get('[data-cy="ingredients-module"]')
      .contains('Хрустящие минеральные кольца')
      .parent()
      .find('button')
      .click({ force: true });

    // Нажимаем кнопку оформления заказа
    cy.get('[data-cy="order-button"]').click();

    // Ожидаем успешного создания заказа
    cy.wait('@postOrder').its('response.statusCode').should('eq', 200);

    // Проверяем, что открылось модальное окно с номером заказа
    cy.get('[data-cy="modal"]').should('exist');
    cy.get('[data-cy="order-number"]').should('contain', '12345'); // Проверяем номер заказа

    // Закрываем модальное окно
    cy.get('[data-cy="modal-close"]').click();
    cy.get('[data-cy="modal"]').should('not.exist');

    // Проверяем, что конструктор пуст после оформления заказа
    cy.get('[data-cy="constructor-bun"]').should('not.exist');
    cy.get('[data-cy="constructor-filling"]').should('not.exist');
  });
});
