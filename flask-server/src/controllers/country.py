from flask import request, jsonify
from models.countries import Countries


def get_all_countries():
    try:
        params = request.args
        if "limit" in params:
            limit = int(params.get("limit"))
            curr_page = int(params.get("page", 1))
            countries = (
                Countries.query.offset(limit * (curr_page - 1)).limit(limit).all()
            )
            count_documents = Countries.query.count()
            return (
                jsonify(
                    {
                        "success": True,
                        "countries": [country.to_dict() for country in countries],
                        "pages": -(-count_documents // limit),  # Tính số trang
                    }
                ),
                200,
            )
        else:
            countries = Countries.query.all()
            return (
                jsonify(
                    {
                        "success": True,
                        "data": [country.to_dict() for country in countries],
                    }
                ),
                200,
            )
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "message": str(e),
                }
            ),
            500,
        )
