from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from docx import Document
import os
import io

app = FastAPI()

def calculate_eigenvector(matrix):
    eigenvalues, eigenvectors = np.linalg.eig(matrix)
    max_eigenvalue = np.max(eigenvalues)
    max_eigenvector = eigenvectors[:, np.argmax(eigenvalues)]
    normalized_vector = max_eigenvector / np.sum(max_eigenvector)
    return max_eigenvalue, normalized_vector.real

def calculate_consistency(matrix, max_eigenvalue):
    n = matrix.shape[0]
    ci = (max_eigenvalue - n) / (n - 1)
    ri_values = {1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
    ri = ri_values.get(n, 1.49)
    cr = ci / ri if ri != 0 else 0
    return ci, cr, ri

def geometric_mean(matrices):
    product_matrix = np.ones_like(matrices[0])
    for matrix in matrices:
        product_matrix *= matrix
    return np.power(product_matrix, 1/len(matrices))

def create_matrices(file_content):
    data = pd.read_csv(io.StringIO(file_content), header=None)

    # Skip non-numeric rows (headers)
    numeric_data = data.apply(pd.to_numeric, errors='coerce')
    numeric_data = numeric_data.dropna().reset_index(drop=True)

    num_engineers = numeric_data.shape[0]
    num_sub_criteria = numeric_data.shape[1]

    engineer_matrices = {}

    for i in range(num_engineers):
        sub_criteria = numeric_data.iloc[i].values
        matrix = np.eye(num_sub_criteria)
        
        k = 0
        for row in range(num_sub_criteria):
            for col in range(row + 1, num_sub_criteria):
                matrix[row, col] = sub_criteria[k]
                matrix[col, row] = 1 / sub_criteria[k]
                k += 1

        engineer_matrices[f'Engineer {i + 1}'] = matrix

    return engineer_matrices

def process_criteria(file_content):
    engineer_matrices = create_matrices(file_content)
    
    consistent_matrices = []
    results = []

    # Process each matrix
    for engineer, matrix in engineer_matrices.items():
        max_eigenvalue, weights = calculate_eigenvector(matrix)
        ci, cr, ri = calculate_consistency(matrix, max_eigenvalue)
        if cr <= 0.1:
            consistent_matrices.append(matrix)
        results.append({
            'engineer': engineer,
            'matrix': matrix,
            'weights': weights,
            'max_eigenvalue': max_eigenvalue,
            'ci': ci,
            'cr': cr,
            'ri': ri
        })

    # Aggregate the matrices
    if consistent_matrices:
        aggregate_matrix = geometric_mean(consistent_matrices)
        max_eigenvalue, weights = calculate_eigenvector(aggregate_matrix)
        ci, cr, ri = calculate_consistency(aggregate_matrix, max_eigenvalue)
        aggregate_result = {
            'aggregate_matrix': aggregate_matrix,
            'weights': weights,
            'max_eigenvalue': max_eigenvalue,
            'ci': ci,
            'cr': cr,
            'ri': ri
        }
    else:
        aggregate_result = None

    return results, aggregate_result

def save_to_word(results, aggregate_result):
    doc = Document()
    doc.add_heading('Criteria Analysis', level=1)

    for result in results:
        doc.add_heading(result['engineer'], level=2)
        doc.add_paragraph(f"Pairwise Comparison Matrix:\n{result['matrix']}")
        doc.add_paragraph(f"Weights:\n{result['weights']}")
        doc.add_paragraph(f"Max Eigenvalue: {result['max_eigenvalue']}")
        doc.add_paragraph(f"Consistency Index (CI): {result['ci']}")
        doc.add_paragraph(f"Consistency Ratio (CR): {result['cr']}")
        doc.add_paragraph(f"Random Index (RI): {result['ri']}")
        doc.add_paragraph("\n")

    if aggregate_result:
        doc.add_heading('Aggregate Results', level=2)
        doc.add_paragraph(f"Aggregate Pairwise Comparison Matrix:\n{aggregate_result['aggregate_matrix']}")
        doc.add_paragraph(f"Aggregate Weights:\n{aggregate_result['weights']}")
        doc.add_paragraph(f"Aggregate Max Eigenvalue: {aggregate_result['max_eigenvalue']}")
        doc.add_paragraph(f"Aggregate Consistency Index (CI): {aggregate_result['ci']}")
        doc.add_paragraph(f"Aggregate Consistency Ratio (CR): {aggregate_result['cr']}")
        doc.add_paragraph(f"Aggregate Random Index (RI): {aggregate_result['ri']}")

    doc_path = 'criteria_analysis.docx'
    doc.save(doc_path)
    return doc_path

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        content_str = content.decode("utf-8")

        results, aggregate_result = process_criteria(content_str)
        doc_path = save_to_word(results, aggregate_result)

        return JSONResponse(content={"message": "File processed successfully", "document": doc_path})
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
