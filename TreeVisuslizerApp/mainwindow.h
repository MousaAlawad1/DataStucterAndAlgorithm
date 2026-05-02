#pragma once

#include <QMainWindow>
#include <QWidget>
#include <QPushButton>
#include <QLineEdit>
#include <QSpinBox>
#include <QLabel>
#include <QTextEdit>
#include <QVBoxLayout>
#include <QHBoxLayout>
#include <QFrame>
#include <QPainter>
#include <QPainterPath>
#include <QScrollArea>
#include <QPropertyAnimation>
#include <QGraphicsDropShadowEffect>
#include <vector>

// ===== BST Node =====
struct Node {
    int data;
    Node* left  = nullptr;
    Node* right = nullptr;
    // For drawing
    int x = 0, y = 0;
    Node(int v) : data(v) {}
};

// ===== Tree Canvas Widget =====
class TreeCanvas : public QWidget {
    Q_OBJECT
public:
    explicit TreeCanvas(QWidget* parent = nullptr);
    void setRoot(Node* root);
    void highlightTraversal(const std::vector<int>& order);
    void clearHighlight();

protected:
    void paintEvent(QPaintEvent*) override;

private:
    Node* root_ = nullptr;
    std::vector<int> highlighted_;
    int nodeRadius_ = 26;

    void assignPositions(Node* node, int depth, int left, int right);
    void drawEdges(QPainter& p, Node* node);
    void drawNodes(QPainter& p, Node* node);
    int  treeWidth(Node* node);
    int  treeHeight(Node* node);
};

// ===== Main Window =====
class MainWindow : public QMainWindow {
    Q_OBJECT
public:
    MainWindow(QWidget* parent = nullptr);
    ~MainWindow();

private slots:
    void onBuildTree();
    void onInsertNode();
    void onInorder();
    void onPreorder();
    void onPostorder();
    void onClearHighlight();

private:
    // BST
    Node* root_ = nullptr;
    void  freeTree(Node* node);
    Node* insert(Node* root, int val);
    void  inorder(Node* node, std::vector<int>& out);
    void  preorder(Node* node, std::vector<int>& out);
    void  postorder(Node* node, std::vector<int>& out);

    // UI
    void buildUI();
    void setStatus(const QString& msg, const QString& color = "#00d4aa");

    QWidget*     central_;
    TreeCanvas*  canvas_;
    QScrollArea* scrollArea_;
    QSpinBox*    spinCount_;
    QLineEdit*   lineValues_;
    QLineEdit*   lineInsert_;
    QTextEdit*   resultBox_;
    QLabel*      statusLabel_;

    // Style helper
    QString btnStyle(const QString& bg, const QString& hover);
};
