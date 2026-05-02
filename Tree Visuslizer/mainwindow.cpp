#include "mainwindow.h"
#include <QMessageBox>
#include <QStringList>
#include <QScrollBar>
#include <QPainterPath>
#include <cmath>
#include <algorithm>

// ============================================================
//  TreeCanvas
// ============================================================

TreeCanvas::TreeCanvas(QWidget* parent) : QWidget(parent) {
    setMinimumSize(600, 400);
    setStyleSheet("background: transparent;");
}

void TreeCanvas::setRoot(Node* root) {
    root_ = root;
    highlighted_.clear();
    if (root_) {
        int w = std::max(600, treeWidth(root_) * (nodeRadius_*2 + 20));
        int h = std::max(400, (treeHeight(root_) + 1) * 90 + 20);
        setMinimumSize(w, h);
        assignPositions(root_, 0, 0, w);
    }
    update();
}

void TreeCanvas::highlightTraversal(const std::vector<int>& order) {
    highlighted_ = order;
    update();
}

void TreeCanvas::clearHighlight() {
    highlighted_.clear();
    update();
}

int TreeCanvas::treeWidth(Node* n) {
    if (!n) return 0;
    return std::max(1, treeWidth(n->left) + treeWidth(n->right));
}

int TreeCanvas::treeHeight(Node* n) {
    if (!n) return -1;
    return 1 + std::max(treeHeight(n->left), treeHeight(n->right));
}

void TreeCanvas::assignPositions(Node* node, int depth, int left, int right) {
    if (!node) return;
    node->x = (left + right) / 2;
    node->y = depth * 90 + 50;
    assignPositions(node->left,  depth + 1, left,          (left + right) / 2);
    assignPositions(node->right, depth + 1, (left + right) / 2, right);
}

void TreeCanvas::paintEvent(QPaintEvent*) {
    QPainter p(this);
    p.setRenderHint(QPainter::Antialiasing);

    // Background gradient
    QLinearGradient bg(0, 0, 0, height());
    bg.setColorAt(0, QColor("#0f1117"));
    bg.setColorAt(1, QColor("#1a1d2e"));
    p.fillRect(rect(), bg);

    if (!root_) {
        p.setPen(QColor("#444466"));
        p.setFont(QFont("Segoe UI", 14));
        p.drawText(rect(), Qt::AlignCenter, "Build a tree to visualize it here");
        return;
    }

    drawEdges(p, root_);
    drawNodes(p, root_);
}

void TreeCanvas::drawEdges(QPainter& p, Node* node) {
    if (!node) return;
    QPen edgePen(QColor("#2a2d4a"), 2);
    p.setPen(edgePen);
    if (node->left) {
        p.drawLine(node->x, node->y, node->left->x, node->left->y);
        drawEdges(p, node->left);
    }
    if (node->right) {
        p.drawLine(node->x, node->y, node->right->x, node->right->y);
        drawEdges(p, node->right);
    }
}

void TreeCanvas::drawNodes(QPainter& p, Node* node) {
    if (!node) return;

    int r = nodeRadius_;
    bool isHighlighted = std::find(highlighted_.begin(), highlighted_.end(), node->data) != highlighted_.end();

    // Find position in traversal for number badge
    int traversalPos = -1;
    for (int i = 0; i < (int)highlighted_.size(); i++) {
        if (highlighted_[i] == node->data) { traversalPos = i + 1; break; }
    }

    // Shadow
    QRadialGradient shadow(node->x + 3, node->y + 3, r + 6);
    shadow.setColorAt(0, QColor(0, 0, 0, 80));
    shadow.setColorAt(1, Qt::transparent);
    p.setBrush(shadow);
    p.setPen(Qt::NoPen);
    p.drawEllipse(node->x - r - 3, node->y - r - 3, (r + 3) * 2, (r + 3) * 2);

    // Node fill
    QRadialGradient grad(node->x - r/3, node->y - r/3, r * 1.5);
    if (isHighlighted) {
        grad.setColorAt(0, QColor("#00ffc8"));
        grad.setColorAt(1, QColor("#00897b"));
    } else {
        grad.setColorAt(0, QColor("#3a3f6e"));
        grad.setColorAt(1, QColor("#1e2240"));
    }
    p.setBrush(grad);

    QPen borderPen(isHighlighted ? QColor("#00ffc8") : QColor("#4a4f8e"), isHighlighted ? 2.5 : 1.5);
    p.setPen(borderPen);
    p.drawEllipse(node->x - r, node->y - r, r * 2, r * 2);

    // Value text
    p.setPen(isHighlighted ? QColor("#001a14") : QColor("#e0e4ff"));
    QFont font("Segoe UI", 11, QFont::Bold);
    p.setFont(font);
    p.drawText(QRect(node->x - r, node->y - r, r * 2, r * 2),
               Qt::AlignCenter, QString::number(node->data));

    // Traversal order badge
    if (traversalPos > 0) {
        int br = 10;
        p.setBrush(QColor("#ff6b6b"));
        p.setPen(Qt::NoPen);
        p.drawEllipse(node->x + r - br, node->y - r, br * 2, br * 2);
        p.setPen(Qt::white);
        QFont small("Segoe UI", 7, QFont::Bold);
        p.setFont(small);
        p.drawText(QRect(node->x + r - br, node->y - r, br * 2, br * 2),
                   Qt::AlignCenter, QString::number(traversalPos));
    }

    drawNodes(p, node->left);
    drawNodes(p, node->right);
}

// ============================================================
//  MainWindow
// ============================================================

MainWindow::MainWindow(QWidget* parent) : QMainWindow(parent) {
    setWindowTitle("Binary Search Tree Visualizer");
    setMinimumSize(1000, 700);
    buildUI();
}

MainWindow::~MainWindow() { freeTree(root_); }

void MainWindow::freeTree(Node* node) {
    if (!node) return;
    freeTree(node->left);
    freeTree(node->right);
    delete node;
}

Node* MainWindow::insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->data)      root->left  = insert(root->left, val);
    else if (val > root->data) root->right = insert(root->right, val);
    return root;
}

void MainWindow::inorder(Node* node, std::vector<int>& out) {
    if (!node) return;
    inorder(node->left, out);
    out.push_back(node->data);
    inorder(node->right, out);
}

void MainWindow::preorder(Node* node, std::vector<int>& out) {
    if (!node) return;
    out.push_back(node->data);
    preorder(node->left, out);
    preorder(node->right, out);
}

void MainWindow::postorder(Node* node, std::vector<int>& out) {
    if (!node) return;
    postorder(node->left, out);
    postorder(node->right, out);
    out.push_back(node->data);
}

QString MainWindow::btnStyle(const QString& bg, const QString& hover) {
    return QString(
        "QPushButton {"
        "  background: %1;"
        "  color: white;"
        "  border: none;"
        "  border-radius: 8px;"
        "  padding: 10px 18px;"
        "  font-size: 13px;"
        "  font-weight: bold;"
        "  font-family: 'Segoe UI';"
        "}"
        "QPushButton:hover { background: %2; }"
        "QPushButton:pressed { opacity: 0.85; }"
    ).arg(bg, hover);
}

void MainWindow::buildUI() {
    // ---- Central widget ----
    central_ = new QWidget(this);
    setCentralWidget(central_);
    central_->setStyleSheet("background: #0f1117;");

    auto* mainLayout = new QHBoxLayout(central_);
    mainLayout->setSpacing(0);
    mainLayout->setContentsMargins(0, 0, 0, 0);

    // ========== LEFT PANEL ==========
    auto* panel = new QWidget();
    panel->setFixedWidth(280);
    panel->setStyleSheet(
        "background: #13151f;"
        "border-right: 1px solid #1e2240;"
    );
    auto* panelLayout = new QVBoxLayout(panel);
    panelLayout->setSpacing(12);
    panelLayout->setContentsMargins(20, 24, 20, 20);

    // Title
    auto* title = new QLabel("BST Visualizer");
    title->setStyleSheet(
        "color: #00d4aa;"
        "font-size: 20px;"
        "font-weight: bold;"
        "font-family: 'Segoe UI';"
        "padding-bottom: 4px;"
    );
    panelLayout->addWidget(title);

    auto* subtitle = new QLabel("Binary Search Tree");
    subtitle->setStyleSheet("color: #555577; font-size: 11px; font-family: 'Segoe UI';");
    panelLayout->addWidget(subtitle);

    // Divider
    auto* div1 = new QFrame(); div1->setFrameShape(QFrame::HLine);
    div1->setStyleSheet("color: #1e2240;"); panelLayout->addWidget(div1);

    // --- Build section ---
    auto* buildLabel = new QLabel("BUILD TREE");
    buildLabel->setStyleSheet("color: #888aaa; font-size: 10px; font-family: 'Segoe UI'; letter-spacing: 2px;");
    panelLayout->addWidget(buildLabel);

    auto* countRow = new QHBoxLayout();
    auto* countLbl = new QLabel("Node count:");
    countLbl->setStyleSheet("color: #aaaacc; font-family: 'Segoe UI'; font-size: 13px;");
    spinCount_ = new QSpinBox();
    spinCount_->setRange(1, 30);
    spinCount_->setValue(7);
    spinCount_->setStyleSheet(
        "QSpinBox {"
        "  background: #1e2240; color: #e0e4ff;"
        "  border: 1px solid #2a2d4a; border-radius: 6px;"
        "  padding: 6px; font-size: 13px; font-family: 'Segoe UI';"
        "}"
        "QSpinBox::up-button, QSpinBox::down-button { width: 18px; background: #2a2d4a; border-radius: 3px; }"
    );
    countRow->addWidget(countLbl);
    countRow->addWidget(spinCount_);
    panelLayout->addLayout(countRow);

    auto* valLbl = new QLabel("Values (space-separated):");
    valLbl->setStyleSheet("color: #aaaacc; font-family: 'Segoe UI'; font-size: 13px;");
    panelLayout->addWidget(valLbl);

    lineValues_ = new QLineEdit("50 30 70 20 40 60 80");
    lineValues_->setStyleSheet(
        "QLineEdit {"
        "  background: #1e2240; color: #e0e4ff;"
        "  border: 1px solid #2a2d4a; border-radius: 6px;"
        "  padding: 8px; font-size: 13px; font-family: 'Segoe UI';"
        "}"
        "QLineEdit:focus { border: 1px solid #00d4aa; }"
    );
    panelLayout->addWidget(lineValues_);

    auto* buildBtn = new QPushButton("⬤  Build Tree");
    buildBtn->setStyleSheet(btnStyle("#00897b", "#00a692"));
    buildBtn->setCursor(Qt::PointingHandCursor);
    connect(buildBtn, &QPushButton::clicked, this, &MainWindow::onBuildTree);
    panelLayout->addWidget(buildBtn);

    // Divider
    auto* div2 = new QFrame(); div2->setFrameShape(QFrame::HLine);
    div2->setStyleSheet("color: #1e2240;"); panelLayout->addWidget(div2);

    // --- Insert section ---
    auto* insLabel = new QLabel("INSERT NODE");
    insLabel->setStyleSheet("color: #888aaa; font-size: 10px; font-family: 'Segoe UI'; letter-spacing: 2px;");
    panelLayout->addWidget(insLabel);

    auto* insRow = new QHBoxLayout();
    lineInsert_ = new QLineEdit();
    lineInsert_->setPlaceholderText("Enter value...");
    lineInsert_->setStyleSheet(
        "QLineEdit {"
        "  background: #1e2240; color: #e0e4ff;"
        "  border: 1px solid #2a2d4a; border-radius: 6px;"
        "  padding: 8px; font-size: 13px; font-family: 'Segoe UI';"
        "}"
        "QLineEdit:focus { border: 1px solid #7c6bff; }"
    );
    auto* insBtn = new QPushButton("Insert");
    insBtn->setFixedWidth(70);
    insBtn->setStyleSheet(btnStyle("#4a3fbf", "#5a4fcf"));
    insBtn->setCursor(Qt::PointingHandCursor);
    connect(insBtn, &QPushButton::clicked, this, &MainWindow::onInsertNode);
    insRow->addWidget(lineInsert_);
    insRow->addWidget(insBtn);
    panelLayout->addLayout(insRow);

    // Divider
    auto* div3 = new QFrame(); div3->setFrameShape(QFrame::HLine);
    div3->setStyleSheet("color: #1e2240;"); panelLayout->addWidget(div3);

    // --- Traversal section ---
    auto* travLabel = new QLabel("TRAVERSALS");
    travLabel->setStyleSheet("color: #888aaa; font-size: 10px; font-family: 'Segoe UI'; letter-spacing: 2px;");
    panelLayout->addWidget(travLabel);

    auto* inBtn = new QPushButton("Inorder   (L → Root → R)");
    inBtn->setStyleSheet(btnStyle("#1a6b8a", "#1e7ea0"));
    inBtn->setCursor(Qt::PointingHandCursor);
    connect(inBtn, &QPushButton::clicked, this, &MainWindow::onInorder);
    panelLayout->addWidget(inBtn);

    auto* preBtn = new QPushButton("Preorder  (Root → L → R)");
    preBtn->setStyleSheet(btnStyle("#6b3a8a", "#7e45a0"));
    preBtn->setCursor(Qt::PointingHandCursor);
    connect(preBtn, &QPushButton::clicked, this, &MainWindow::onPreorder);
    panelLayout->addWidget(preBtn);

    auto* postBtn = new QPushButton("Postorder (L → R → Root)");
    postBtn->setStyleSheet(btnStyle("#8a4a1a", "#a05720"));
    postBtn->setCursor(Qt::PointingHandCursor);
    connect(postBtn, &QPushButton::clicked, this, &MainWindow::onPostorder);
    panelLayout->addWidget(postBtn);

    auto* clearBtn = new QPushButton("✕  Clear Highlight");
    clearBtn->setStyleSheet(btnStyle("#2a2d4a", "#3a3f6e"));
    clearBtn->setCursor(Qt::PointingHandCursor);
    connect(clearBtn, &QPushButton::clicked, this, &MainWindow::onClearHighlight);
    panelLayout->addWidget(clearBtn);

    // Divider
    auto* div4 = new QFrame(); div4->setFrameShape(QFrame::HLine);
    div4->setStyleSheet("color: #1e2240;"); panelLayout->addWidget(div4);

    // --- Result box ---
    auto* resLabel = new QLabel("RESULT");
    resLabel->setStyleSheet("color: #888aaa; font-size: 10px; font-family: 'Segoe UI'; letter-spacing: 2px;");
    panelLayout->addWidget(resLabel);

    resultBox_ = new QTextEdit();
    resultBox_->setReadOnly(true);
    resultBox_->setFixedHeight(90);
    resultBox_->setStyleSheet(
        "QTextEdit {"
        "  background: #0a0c14; color: #00d4aa;"
        "  border: 1px solid #1e2240; border-radius: 6px;"
        "  padding: 8px; font-size: 13px; font-family: 'Consolas', monospace;"
        "}"
    );
    panelLayout->addWidget(resultBox_);

    panelLayout->addStretch();

    // Status label
    statusLabel_ = new QLabel("Ready — Build a tree to get started.");
    statusLabel_->setWordWrap(true);
    statusLabel_->setStyleSheet(
        "color: #00d4aa; font-size: 11px;"
        "font-family: 'Segoe UI';"
        "background: #0a0c14;"
        "border: 1px solid #1e2240;"
        "border-radius: 6px; padding: 8px;"
    );
    panelLayout->addWidget(statusLabel_);

    // ========== RIGHT: Canvas ==========
    canvas_ = new TreeCanvas();
    scrollArea_ = new QScrollArea();
    scrollArea_->setWidget(canvas_);
    scrollArea_->setWidgetResizable(false);
    scrollArea_->setStyleSheet("background: transparent; border: none;");
    scrollArea_->setAlignment(Qt::AlignCenter);

    mainLayout->addWidget(panel);
    mainLayout->addWidget(scrollArea_, 1);

    // Build default tree
    onBuildTree();
}

void MainWindow::setStatus(const QString& msg, const QString& color) {
    statusLabel_->setText(msg);
    statusLabel_->setStyleSheet(
        QString("color: %1; font-size: 11px; font-family: 'Segoe UI';"
                "background: #0a0c14; border: 1px solid #1e2240;"
                "border-radius: 6px; padding: 8px;").arg(color)
    );
}

void MainWindow::onBuildTree() {
    QString text = lineValues_->text().trimmed();
    if (text.isEmpty()) {
        setStatus("Please enter values first.", "#ff6b6b");
        return;
    }

    freeTree(root_);
    root_ = nullptr;

    QStringList parts = text.split(' ', Qt::SkipEmptyParts);
    QStringList inserted;
    for (const QString& p : parts) {
        bool ok;
        int val = p.toInt(&ok);
        if (ok) {
            root_ = insert(root_, val);
            inserted << QString::number(val);
        }
    }

    canvas_->setRoot(root_);
    resultBox_->clear();
    setStatus(QString("Tree built with %1 node(s).").arg(inserted.size()));
}

void MainWindow::onInsertNode() {
    bool ok;
    int val = lineInsert_->text().toInt(&ok);
    if (!ok) {
        setStatus("Enter a valid integer to insert.", "#ff6b6b");
        return;
    }
    root_ = insert(root_, val);
    canvas_->setRoot(root_);
    lineInsert_->clear();
    setStatus(QString("Inserted: %1").arg(val));
}

void MainWindow::onInorder() {
    if (!root_) { setStatus("Build a tree first!", "#ff6b6b"); return; }
    std::vector<int> out;
    inorder(root_, out);
    QStringList lst;
    for (int v : out) lst << QString::number(v);
    resultBox_->setText("Inorder:\n" + lst.join("  →  "));
    canvas_->highlightTraversal(out);
    setStatus("Inorder traversal — sorted ascending.", "#00d4aa");
}

void MainWindow::onPreorder() {
    if (!root_) { setStatus("Build a tree first!", "#ff6b6b"); return; }
    std::vector<int> out;
    preorder(root_, out);
    QStringList lst;
    for (int v : out) lst << QString::number(v);
    resultBox_->setText("Preorder:\n" + lst.join("  →  "));
    canvas_->highlightTraversal(out);
    setStatus("Preorder traversal — root visited first.", "#a78bfa");
}

void MainWindow::onPostorder() {
    if (!root_) { setStatus("Build a tree first!", "#ff6b6b"); return; }
    std::vector<int> out;
    postorder(root_, out);
    QStringList lst;
    for (int v : out) lst << QString::number(v);
    resultBox_->setText("Postorder:\n" + lst.join("  →  "));
    canvas_->highlightTraversal(out);
    setStatus("Postorder traversal — root visited last.", "#fb923c");
}

void MainWindow::onClearHighlight() {
    canvas_->clearHighlight();
    resultBox_->clear();
    setStatus("Highlight cleared.");
}
