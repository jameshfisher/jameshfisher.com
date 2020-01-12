
#include <stdlib.h>
#include <stdio.h>

typedef struct Pt { 
  int x; 
  int y; 
} Pt;

Pt rotate_pt(int width, Pt pt) {
  return (Pt){
    width-1-pt.y,
    pt.x
  };
}

typedef int Px;

typedef struct Matrix {
  int width;
  Px* arr;
} Matrix;

Px matrix_get(Matrix m, Pt pt) {
  return m.arr[(pt.x * m.width) + pt.y];
}

void matrix_set(Matrix m, Pt pt, Px px) {
  m.arr[(pt.x * m.width) + pt.y] = px;
}

void rotate_matrix_at(Matrix m, Pt pt1) {
  Pt pt2 = rotate_pt(m.width, pt1);
  Pt pt3 = rotate_pt(m.width, pt2);
  Pt pt4 = rotate_pt(m.width, pt3);

  Px tmp =           matrix_get(m, pt1);
  matrix_set(m, pt1, matrix_get(m, pt4));
  matrix_set(m, pt4, matrix_get(m, pt3));
  matrix_set(m, pt3, matrix_get(m, pt2));
  matrix_set(m, pt2, tmp);
}

void rotate_matrix(Matrix m) {
  int num_x = (m.width/2) + (m.width%2);
  int num_y = m.width/2;
  for (int y = 0; y < num_y; y++) {
    for (int x = 0; x < num_x; x++) {
      rotate_matrix_at(m, (Pt){x,y});
    }
  }
}

void print_matrix(Matrix m) {
  for (int y = 0; y < m.width; y++) {
    for (int x = 0; x < m.width; x++) {
      Px px = matrix_get(m, (Pt){x,y});
      printf("%i  ", px);
    }
    printf("\n");
  }
  printf("\n");
}

Matrix test_matrix(int width) {
  Matrix test = (Matrix){
    width,
    calloc(width*width, sizeof(Px))
  };
  for (int x = 0; x < width; x++) {
    for (int y = 0; y < width; y++) {
      matrix_set(test, (Pt){x,y}, (x+1)*10+y+1);
    }
  }
  return test;
}

int main(int argc, char** argv) {
  Matrix test_odd = test_matrix(3);
  print_matrix(test_odd);
  rotate_matrix(test_odd);
  print_matrix(test_odd);

  Matrix test_even = test_matrix(4);
  print_matrix(test_even);
  rotate_matrix(test_even);
  print_matrix(test_even);

  return 0;
}