const mock = require("./mock");
const { request } = require("./request");

const USE_MOCK = true;
const mockDelay = 120;

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function fromMock(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(clone(data));
    }, mockDelay);
  });
}

function getHomeData() {
  if (!USE_MOCK) return request({ url: "/api/home" });
  return fromMock({
    currentCase: mock.caseSummary,
    productSteps: mock.productSteps,
    mainActions: mock.mainActions
  });
}

function getCaseList() {
  if (!USE_MOCK) return request({ url: "/api/cases" });
  return fromMock([mock.caseSummary]);
}

function getCaseDashboard() {
  if (!USE_MOCK) return request({ url: "/api/cases/current/dashboard" });
  return fromMock({
    currentCase: mock.caseSummary,
    tasks: mock.tasks,
    stages: mock.productSteps,
    documentDrafts: mock.documentDrafts
  });
}

function getMaterials() {
  if (!USE_MOCK) return request({ url: "/api/materials" });
  return fromMock(mock.materials);
}

function getCompensationReport() {
  if (!USE_MOCK) return request({ url: "/api/claims/report" });
  return fromMock({
    currentCase: mock.caseSummary,
    claimItems: mock.claimItems,
    missingImpacts: mock.missingImpacts
  });
}

function getDocumentDrafts() {
  if (!USE_MOCK) return request({ url: "/api/documents/drafts" });
  return fromMock(mock.documentDrafts);
}

function getProducts() {
  if (!USE_MOCK) return request({ url: "/api/orders/products" });
  return fromMock(mock.products);
}

function getProfileRows() {
  if (!USE_MOCK) return request({ url: "/api/profile" });
  return fromMock(mock.profileRows);
}

module.exports = {
  getHomeData,
  getCaseList,
  getCaseDashboard,
  getMaterials,
  getCompensationReport,
  getDocumentDrafts,
  getProducts,
  getProfileRows
};
